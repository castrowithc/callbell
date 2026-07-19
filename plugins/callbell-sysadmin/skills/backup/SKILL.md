---
name: backup
description: >
  Richtet eine verschlüsselte, ausgelagerte Sicherung mit BorgBackup und Borgmatic auf ein
  SSH/SFTP-Ziel ein oder rüstet sie nach: Repo anlegen, Konfiguration, Benachrichtigung, Zugangsdaten,
  Wiederherstellungstest. Starte es, indem du /callbell-sysadmin:backup tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Eine Sicherung einrichten: Borg + Borgmatic + ausgelagertes SSH/SFTP-Ziel

Richtet die Sicherung auf einem Server so ein, dass die Form gleich bleibt, wenn es mehr werden. Werte, die
je Server anders sind (Unterkonto, Webhooks, Schlüssel, Containerliste), gehören in die Domäne dieses Hosts
(Ordner `<host>/`), **nie** ins Repo oder ins Plugin.

> **3-2-1-Prinzip:** 3 Kopien, 2 Speichertechniken, 1 ausgelagert (ein ausgelagertes SSH/SFTP-Ziel, etwa
> eine Hetzner Storage Box).

## Planmodus: zuerst entscheiden

- **Speicher-Unterkonto** für diesen Server auf dem ausgelagerten Ziel.
- **Zeitfenster:** eine feste Startzeit, ohne Streuung, in den ruhigen Stunden des Hosts. Bei einem Server
  wählst du die Zeit und bist fertig. Sobald mehrere auf dasselbe Ziel sichern, versetzt du sie (03:00 /
  03:15 / 03:30 und so weiter), damit sie nicht alle gleichzeitig darauf zugreifen. Ein automatischer
  Neustart liegt, falls aktiv, **nach** dem Fenster.
- **Benachrichtigungsweg:** ein Webhook plus ein Healthcheck-Heartbeat (etwa eine Push-Adresse des
  Monitorings), dein bevorzugter Kanal, oder E-Mail (msmtp, etwa bei Plesk). Mindestens **ein** Weg ist
  Pflicht (Erfolg **und** Fehlschlag).
- **Docker-Server?** → zusätzlich Datenbank-Dumps vor der Sicherung (Begleitdatei `db-dumps.md`).
- **Init-System:** systemd (Normalfall, `borgmatic.timer`) oder ein cron-Ersatz auf Distributionen ohne
  systemd.

## Standardwerte

| Wert | Vorgabe |
|---|---|
| Ziel | ein ausgelagertes SSH/SFTP-Ziel (etwa eine Hetzner Storage Box); eigenes Unterkonto je Server |
| Rhythmus | täglich, zu einer festen ruhigen Zeit (versetzt je Server, sobald es mehrere sind) |
| Aufbewahrung | 7 täglich, 4 wöchentlich, 6 monatlich |
| Verschlüsselung | repokey-blake2 |
| Kompression | zstd,3 |
| Standardverzeichnisse | `/etc/`, `/home/`, `/opt/` (Abweichungen je Server) |

## Vorgehen

1. **Werkzeuge installieren:** BorgBackup 1.2.x und Borgmatic 2.x (Debian/Ubuntu:
   `apt install borgbackup borgmatic`; sonst das Paket der Distribution oder pipx). Versionen prüfen.
2. **SSH-Schlüssel für das Ziel** erzeugen und dort hinterlegen:
   `ssh-keygen -t ed25519 -f /root/.ssh/storage_box` (chmod 600); den öffentlichen Schlüssel auf dem Ziel
   freischalten (Robot oder Konsole des Anbieters). Bei einer Hetzner Storage Box etwa Port 23.
3. **Passphrase erzeugen** und sichern: in einem Passwortspeicher (Pflicht, Verlust bedeutet
   Totalverlust) **und** nach `/root/.borg-passphrase` (chmod 600).
4. **Repo anlegen:**
   ```bash
   BORG_PASSPHRASE=$(cat /root/.borg-passphrase) \
   borg init --encryption=repokey-blake2 \
     --rsh "ssh -i /root/.ssh/storage_box -p <port>" \
     ssh://<benutzer>@<ziel-host>:<port>/./borg
   ```
   Danach den Schlüsselexport sichern: Passwortspeicher plus `/root/.borg-key-backup` (chmod 600).
5. **Borgmatic-Konfiguration** `/etc/borgmatic/config.yaml` anlegen: Quellverzeichnisse, Ziel-Repo, die
   Aufbewahrung von oben, Verschlüsselung `repokey-blake2` und die Benachrichtigungs-Hooks (die genauen
   Schlüssel stehen in der Dokumentation von borgmatic). Auf einem Docker-Server gehört der Hook für die
   Datenbank-Dumps in `before_backup` (der vollständige Hooks-Block steht in `db-dumps.md`).
6. **Benachrichtigung einrichten** nach dem Abschnitt unten. Leg das Skript an einen stabilen Ort, der root
   gehört (in diesem Vorgehen `/root/backup/borg-notify.sh`), und ruf es aus den Hooks
   `on_error`/`after_backup` auf. Echte Adressen und Schlüssel nur in einer chmod-600-Env-Datei daneben.
7. **Docker-Server:** Datenbank-Dumps vor der Sicherung einhängen → `db-dumps.md`.
8. **Automatisieren:** den systemd-Timer `borgmatic.timer` zur oben festgelegten Zeit aktivieren. Ohne
   systemd ein cron-Eintrag zur selben Zeit.
9. **Erster Lauf und Wiederherstellungstest:** `sudo borgmatic create --verbosity 1`, danach eine einzelne
   Datei zurückholen (siehe unten) und das Datum in der Domäne dieses Hosts festhalten.

## Benachrichtigung

Worauf es ankommt: Erfolg **und** Fehlschlag erreichen dich, und die Nachricht sagt, welcher Host, welcher
Lauf und was schiefging. Die folgende Form ist eine funktionierende Konvention, kein Schema, das irgendwer
erwartet:

```json
{ "host": "<hostname>", "type": "backup", "status": "success | error",
  "timestamp": "<UTC ISO 8601>", "duration": <sek>, "error": "" }
```

Übernimm sie, oder richte dich nach dem, was dein Empfänger ohnehin liest. Dasselbe gilt für die Ablage:
dieses Vorgehen legt Skript und Geheimnisse unter `/root/backup/` ab, mit Variablennamen wie
`WEBHOOK_BACKUP_SUCCESS` und `HEALTHCHECK_PUSH_URL` — ein ordentlicher Standard und nicht mehr. Ein Host,
der bereits einen Platz für Betriebsskripte hat, nutzt diesen Platz.

Unabhängig von der Ablage gilt fest: echte Adressen und Schlüssel leben nur in einer Env-Datei, die allein
root lesen kann (chmod 600), nie in der borgmatic-Konfiguration. **Regel für Geheimnisse:** Webhook-Adressen
und Schlüssel nie ausgeben, nie protokollieren, nie committen; in Beispielen ein Server-Alias statt der
echten Adresse.

> **Syntax `commands:` in Borgmatic 2.x:** den Block `after: error` **ohne `when:`-Filter** konfigurieren,
> sonst feuert der Fehler-Hook nicht bei Fehlschlägen in früheren Hooks (etwa einem Datenbank-Dump in
> `before: everything`). Die reale Folge eines Filters `when: [create]`: 23 Tage ohne Benachrichtigung,
> unbemerkt, weil der Fehler-Hook bei den früheren Fehlschlägen nicht ausgelöst hat.

> **Healthcheck-Heartbeat** als zweite Schicht: ein Heartbeat (etwa eine Push-Adresse des Monitorings) mit
> einer Zeitgrenze (etwa 26 Stunden bei täglicher Sicherung), der selbst dann greift, wenn die
> Benachrichtigungskette ausfällt.

**Alternative per E-Mail (msmtp):** statt des Webhooks oder zusätzlich ein Mail-Skript im Hook
`on_error`/`after_backup`; Zugangsdaten nur in `backup.env` oder der msmtp-Konfiguration (chmod 600).

## Sicherung der Zugangsdaten

| Was | Wohin |
|---|---|
| Borg-Passphrase | Passwortspeicher (Pflicht) plus `/root/.borg-passphrase` (chmod 600) |
| Borg-Schlüsselexport | Passwortspeicher plus `/root/.borg-key-backup` (chmod 600) |
| SSH-Schlüssel für das Ziel | `/root/.ssh/storage_box` (chmod 600) |

## Wichtige Befehle

```bash
sudo borgmatic create --verbosity 1     # Sicherung von Hand
sudo borgmatic list                     # Liste der Archive
sudo borgmatic info                     # Status
# Wiederherstellen (einzelne Datei)
cd /tmp && sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<benutzer>@<ziel-host>/./borg::<ARCHIV> pfad/zur/datei
```
