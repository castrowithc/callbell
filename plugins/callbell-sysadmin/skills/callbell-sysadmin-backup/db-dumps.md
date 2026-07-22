---
description: >
  Begleitdatei zu callbell-sysadmin-backup (nur Docker-Server): konsistente Datenbank-Dumps vor der
  Borg-Sicherung über einen before_backup-Hook. Die Containerliste steht in der Domäne des Hosts.
type: playbook
edit: locked
---

# Datenbank-Dumps vor der Borg-Sicherung (Docker-Server)

Borg sichert das **Dateisystem**, nicht den **inneren Zustand** laufender Datenbanken. Eine Sicherung von
`/var/lib/postgresql/data` auf Dateiebene kann während Schreibvorgängen inkonsistent sein. Ein vorher
erzeugter Dump (`pg_dumpall` oder ähnlich) ist konsistent, klein und leicht wieder einzuspielen.

## Verhalten im Fehlerfall

| Lage | Reaktion | Warum |
|---|---|---|
| **Container läuft nicht** (Stack pausiert oder entfernt) | **WARN, überspringen, weitermachen** | geplante Ausfallzeit soll die Dateisicherung nicht blockieren; der veraltete Dump wird gelöscht |
| **Container läuft, Dump scheitert** | **ERROR, Sicherung abbrechen** | echter Fehler, keine "grüne" Sicherung ohne gültigen Datenbankstand |

Dauerhaft entfernte Container auch aus der Liste im Skript streichen, sonst häufen sich WARNs und schwächen
die Aufmerksamkeit für die echten.

## Einbindung in Borgmatic

In `/etc/borgmatic/config.yaml`:

```yaml
source_directories:
  - /etc
  - /home
  - /opt
  - /root/backup/borg/db-dumps   # die Dumps mit aufnehmen

hooks:
  before_backup:
    - date +%s > /tmp/.borgmatic-start-time
    - /root/backup/borg/pre-backup-db-dump.sh
  on_error:
    - /root/backup/borg-notify.sh error
  after_backup:
    - /root/backup/borg-notify.sh success
```

## Vorlage `/root/backup/borg/pre-backup-db-dump.sh`

Das Skript bleibt englisch: es ist Code, der auf dem Host läuft, und seine Meldungen landen im Protokoll
von borgmatic, wo eine gemischte Sprache das Auswerten erschwert.

```bash
#!/bin/bash
# Pre-backup database dump script for borgmatic
# Dumps all databases from running containers before borg backup.
# Credentials are read from within each container (no hardcoded passwords).
#
# Failure policy:
#   - Container not running        -> WARN, skip, continue (allows planned downtime of stacks)
#   - Container running, dump fails -> ERROR, abort backup (real failure)

set -uo pipefail

DUMP_DIR="/root/backup/borg/db-dumps"
ERRORS=0
SKIPPED=0

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DB-DUMP] $*"; }
warn() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DB-DUMP] WARN: $*" >&2; SKIPPED=$((SKIPPED+1)); }
error(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DB-DUMP] ERROR: $*" >&2; ERRORS=$((ERRORS+1)); }

is_running() {
    docker inspect -f '{{.State.Running}}' "$1" 2>/dev/null | grep -qx true
}

log "Starting database dumps..."
mkdir -p "$DUMP_DIR"
chmod 700 "$DUMP_DIR"

dump_postgres() {
    local container="$1"
    local outfile="$DUMP_DIR/${container}.sql"
    if ! is_running "$container"; then
        warn "Container $container not running, skipping (stale dump removed)"
        rm -f "$outfile"
        return 0
    fi
    log "Dumping PostgreSQL: $container"
    if docker exec "$container" bash -c 'pg_dumpall -U "$POSTGRES_USER"' > "$outfile" 2>&1; then
        log "  OK: $(du -sh "$outfile" | cut -f1)"
    else
        error "Failed to dump $container (container is running, dump command failed)"
        rm -f "$outfile"
    fi
}

dump_mariadb() {
    local container="$1"
    local outfile="$DUMP_DIR/${container}.sql"
    if ! is_running "$container"; then
        warn "Container $container not running, skipping (stale dump removed)"
        rm -f "$outfile"
        return 0
    fi
    log "Dumping MariaDB: $container"
    local dump_cmd
    if docker exec "$container" which mariadb-dump > /dev/null 2>&1; then
        dump_cmd="mariadb-dump"
    else
        dump_cmd="mysqldump"
    fi
    if docker exec "$container" bash -c "${dump_cmd} --all-databases --single-transaction -u root -p\"\$MYSQL_ROOT_PASSWORD\"" > "$outfile" 2>&1; then
        log "  OK (${dump_cmd}): $(du -sh "$outfile" | cut -f1)"
    else
        error "Failed to dump $container (container is running, dump command failed)"
        rm -f "$outfile"
    fi
}

# Server-specific container list, documented in this host's domain
dump_postgres "<postgres-container-1>"
dump_postgres "<postgres-container-2>"

dump_mariadb "<mariadb-container-1>"
# add further dump_mariadb / dump_postgres calls as needed

# Special cases (e.g. an all-in-one container with an internal DB)
# container="<some-app>"; outfile="$DUMP_DIR/${container}.sql"
# if ! is_running "$container"; then
#     warn "..."; rm -f "$outfile"
# else
#     ...specific dump command...
# fi

log "Database dumps finished. Skipped: $SKIPPED, Errors: $ERRORS"
if [ "$ERRORS" -gt 0 ]; then
    error "One or more database dumps failed for RUNNING containers, aborting backup."
    exit 1
fi
exit 0
```

**Anpassungen je Server:**

- Aufrufe von `dump_postgres`/`dump_mariadb` mit den tatsächlich verwendeten Containernamen.
- Sonderfälle (eine interne Datenbank ohne offenen root-Zugang) bekommen einen eigenen Block
  (Beispiel OpenProject: `docker exec ... su - postgres -c "pg_dumpall"`).
- Hat ein Container keinen Benutzer `postgres`: den passenden über `-U` setzen.

## Pflege

- **Stack entfernt?** → die `dump_*`-Zeile streichen (sonst WARNs).
- **Neuer Stack mit Datenbank?** → eine `dump_*`-Zeile ergänzen plus einen Eintrag in der Domäne des Hosts.
- **WARNs häufen sich?** → prüfen, ob der Container nur kurz oder dauerhaft unten war.

## Wiederherstellen (eine einzelne Datenbank)

```bash
sudo borgmatic extract --archive latest \
  --path root/backup/borg/db-dumps/<container>.sql --destination /tmp/restore/
cat /tmp/restore/root/backup/borg/db-dumps/<container>.sql \
  | docker exec -i <container> psql -U postgres
```

## Sicherheitsregeln

- Dump-Verzeichnis chmod 700, Dateien chmod 600 (Anwendungsdaten im Klartext).
- Umgebungsvariablen des Containers **nicht** direkt über `docker exec` referenzieren (Geheimnis landet in
  Protokoll und argv). Das Passwort mit `sh -c '... "$VAR"'` **innerhalb** des Containers auflösen, nicht in
  der Shell des Hosts.
- Das Dump-Skript gehört root:root, chmod 700.
- Die festgehaltene Containerliste enthält nur **Namen**, keine Passwörter und keine Verbindungszeichenfolgen.
