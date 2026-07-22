---
name: callbell-sysadmin-docker-update
description: >
  Aktualisiert einen Docker-Stack oder die Docker-Engine: Update-Klassen, Ablauf je Stack, Migration bei
  Datenbank-Hauptversionen, Verbote. Starte es, indem du /callbell-sysadmin-docker-update tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Update-Strategie für Docker

Deckt Updates von Stacks und der Docker-Engine auf deinen Docker-Servern ab. Welche Images und Versionen
gerade laufen, wird je Server live gelesen (`docker ps`). Eigenheiten einer Anwendung und ihre offiziellen
Quellen liegen in der Domäne dieses Hosts (Ordner `<host>/`), eine Datei je Anwendung.

## Update-Klassen

| Art des Updates | Risiko | Vorgehen |
|---|---|---|
| Sicherheitsupdates (System) | gering | sofort einspielen (kein Docker beteiligt, kein Neustart) |
| Systemupdates (System) | gering | sofort einspielen (geringes Risiko) |
| **Updates der Docker-Engine** (`docker-ce`, `containerd.io`, `docker-compose-plugin`) | **mittel** | **getrennt planen**: braucht `systemctl restart docker`, **alle Container fallen kurz aus**. Vorher den Containerstatus prüfen, danach alle Stacks nachsehen |
| Image-Updates eines Stacks (Anwendungscontainer) | hängt von der Anwendung ab | Ablauf je Stack (siehe unten) |
| Hauptversionswechsel einer Datenbank | **hoch** | braucht eine eigene Migration (pg_dump/restore, mysqldump). **Die Hauptversion nie automatisch wechseln** |
| Kernel-Updates | hoch | Wartungsfenster einplanen (Neustart nötig) |

## Ablauf je Stack

1. **Release Notes lesen**: die offiziellen Adressen aus den Anwendungsnotizen dieses Hosts
2. **Auf brechende Änderungen prüfen**: Migrationen, geänderte Umgebungsvariablen, Aufbau der Volumes
3. **Sicherung vorhanden?**: steht die letzte Borg-Sicherung auf `OK` (`sudo borgmatic info`)? Bei
   Änderungen am Datenbankschema abwägen, ob ein Dump von Hand nötig ist
4. **Version anpassen**: `image:` in `/opt/stack/<dienst>/compose.yaml` auf das neue Tag setzen
5. **Ziehen und neu starten**: `cd /opt/stack/<dienst> && docker compose pull && docker compose up -d`
6. **Logs prüfen**: `docker compose logs --tail=200 <dienst>` auf Fehler und Warnungen
7. **Funktionsprüfung**: Anmeldung und eine Kernfunktion der Anwendung nachvollziehen
8. **Bei Erfolg**: die Version läuft (`docker ps`), es gibt keine Versionsspalte zu pflegen; neue
   Eigenheiten und Stolperstellen bei Bedarf in den Anwendungsnotizen dieses Hosts ergänzen
9. **Bei Fehlschlag**: auf das alte Tag zurück (`compose.yaml` zurücksetzen, `up -d`), die Logs sichern,
   das Problem analysieren, bevor das Update erneut versucht wird

## Image-Updates von Datenbanken

- **Neben- oder Patchversion** (`postgres:17.1` auf `17.2`): unkritisch, wie ein Stack-Update behandeln
- **Hauptversion** (`postgres:16` auf `17`): **STOPP**.
  1. Dump der Datenbank (`pg_dumpall`) auf der alten Version
  2. Datenverzeichnis sichern (`./data/postgres` in ein Tar-Archiv)
  3. compose mit der neuen Hauptversion und leerem Datenverzeichnis starten
  4. Dump einspielen
  5. Funktionsprüfung
  6. Erst danach das alte Datenverzeichnis verwerfen

Bei Alles-in-einem-Containern (etwa OpenProject) folgt die Datenbankversion dem Haupt-Tag der Anwendung:
den Migrationsschritten des Herstellers folgen.

## Sonderfälle (typisch)

- **Anwendungen mit mehreren gemeinsam gepinnten Images** (etwa Penpot: Frontend, Backend, Exporter): alle
  Images im selben Schritt aktualisieren, nie einzeln
- **Anwendungen mit eigenem Migrationsskript** (etwa SeaTable, Nextcloud): die Migrationsanweisungen aus
  den Release Notes vor `docker compose up -d` ausführen
- **Anwendungen mit stufenweisem Hauptversionspfad** (etwa Nextcloud: 28 auf 29 auf 30): nie Versionen
  überspringen, jede Hauptversion einzeln durchlaufen, mit einer Prüfung dazwischen

## Update der Docker-Engine

```bash
# Status vorher
docker ps --format 'table {{.Names}}\t{{.Status}}'

# Update
sudo apt-get update
sudo apt-get install -y --only-upgrade docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# Neustart (alle Container werden kurz unterbrochen)
sudo systemctl restart docker

# Container kommen über `restart: unless-stopped` von selbst zurück: nachsehen
sleep 10
docker ps --format 'table {{.Names}}\t{{.Status}}'

# Logs der eben gestoppten Container auf Fehler prüfen
```

## Verbote

- **Kein automatisches Aktualisieren** (etwa über Watchtower) ohne ausdrückliche Konfiguration je Stack
- **Keine `:latest`-Tags** in der compose.yaml: sie machen eine reproduzierbare Zustandserkennung unmöglich
- **Keine Hauptversionswechsel, ohne die Release Notes gelesen zu haben**
- **Kein `docker system prune -a`**, ohne die Stack-Verzeichnisse gesichert zu haben: es löscht Images, die
  für ein Zurückrollen noch gebraucht werden könnten
