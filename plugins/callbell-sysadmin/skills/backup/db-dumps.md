---
description: >
  Resource for callbell-sysadmin:backup (Docker servers only): consistent DB dumps before the Borg backup
  via a before_backup hook. Container list per server in this server's backup context.
type: skill
edit: locked
---

# DB Dumps Before the Borg Backup (Docker Servers)

Borg backs up the **file system**, not the **internal state** of running databases. A file-level backup
of `/var/lib/postgresql/data` during write operations can be inconsistent. A dump created beforehand
(`pg_dumpall` or similar) is consistent, small, and easy to restore.

## Failure policy

| Situation | Reaction | Rationale |
|---|---|---|
| **Container not running** (stack paused/removed) | **WARN, skip, continue** | Planned downtime should not block the file backup; the stale dump is deleted |
| **Container running, dump fails** | **ERROR, abort backup** | Real fault, no "green" backup without a valid DB state |

Delete permanently removed containers from the script list too, otherwise WARNs pile up and weaken
attention to the real WARNs.

## Borgmatic integration

In `/etc/borgmatic/config.yaml`:
```yaml
source_directories:
  - /etc
  - /home
  - /opt
  - /root/backup/borg/db-dumps   # include the dumps

hooks:
  before_backup:
    - date +%s > /tmp/.borgmatic-start-time
    - /root/backup/borg/pre-backup-db-dump.sh
  on_error:
    - /root/backup/borg-notify.sh error
  after_backup:
    - /root/backup/borg-notify.sh success
```

## Script template `/root/backup/borg/pre-backup-db-dump.sh`

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

# Server-specific container list, documented per server in this server's backup context
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

**Per-server adjustments:**
- `dump_postgres`/`dump_mariadb` calls with the container names actually in use.
- Special cases (an internal DB with no open root access) get their own block
  (OpenProject example: `docker exec ... su - postgres -c "pg_dumpall"`).
- If a container has no `postgres` user: set the appropriate user via `-U`.

## Maintenance

- **Stack removed?** -> delete the `dump_*` line (otherwise WARNs).
- **New stack with a DB?** -> add a `dump_*` line + an entry in this server's backup context.
- **WARN piling up?** -> check whether the container was only briefly down or permanently.

## Restore (single database)

```bash
sudo borgmatic extract --archive latest \
  --path root/backup/borg/db-dumps/<container>.sql --destination /tmp/restore/
cat /tmp/restore/root/backup/borg/db-dumps/<container>.sql \
  | docker exec -i <container> psql -U postgres
```

## Security rules

- Dump directory chmod 700, files chmod 600 (plaintext application data).
- Do **NOT** reference container env variables directly via `docker exec` (secret leak in logs/argv).
  Expand the password with `sh -c '... "$VAR"'` **inside** the container, not in the host shell.
- The dump script is owned by root:root, chmod 700.
- The documented container list contains only **names**, no passwords/connection strings.
