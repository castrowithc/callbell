---
paths: ["**/*"]
description: >
  Schutz vor destruktiven Server-Operationen: niemals Geheimnisse offenlegen, destruktive Befehle vor der
  Ausführung erklären und bestätigen lassen, und SSH oder die Firewall nur nach dem
  Zwei-Verbindungen-Muster ändern.
type: rule
edit: locked
---

# Server-Sicherheit: Schutz vor destruktiven Operationen

Auf einem Server haben Befehle echte und oft irreversible Wirkung. Diese Normen gelten, sobald eine
Host-Identität deklariert ist (siehe den Session-Kontext des Packs).

## Niemals sensible Daten offenlegen
- Keine Passwörter, Hashes, privaten Schlüssel oder Tokens im Chat.
- `/etc/shadow` oder `/etc/gshadow` nicht lesen.
- Private SSH-Schlüssel nicht ausgeben (`~/.ssh/id_*` ohne `.pub`).
- `.env`-Dateien nicht im Chat ausgeben.
- Sensible Felder in API-Antworten maskieren.

## Destruktive Operationen
Vor **jeder** der folgenden Aktionen: erkläre, was der Befehl tut, erkläre, was passiert, wenn es
schiefgeht, frage, ob ein Backup nötig oder vorhanden ist, und hol dann die ausdrückliche Bestätigung ein.

Die Liste: `rm -rf` (außerhalb temporärer Dateien); `systemctl stop`/`restart` bei kritischen Diensten (SSH,
Firewall); `ufw disable`, `iptables -F`; `userdel`, `usermod`, `passwd`; `visudo` und sudoers-Änderungen;
`reboot`, `shutdown`; `chmod`/`chown` auf Systemdateien (`/etc/`, `/usr/`, `/var/`);
Paketmanager-`remove`/`purge`.

## SSH- und Firewall-Änderungen: das Zwei-Verbindungen-Muster
Bei **jeder** Änderung an SSH oder der Firewall:
1. Bitte den Nutzer, eine **zweite** SSH-Sitzung offen zu halten.
2. Wende die neue Konfiguration an.
3. Bitte den Nutzer, in der zweiten Sitzung zu testen.
4. Warte auf Bestätigung.
5. **Erst dann** entferne die alte Konfiguration.

Vor jeder SSH- oder Firewall-Änderung prüfe die eine Frage, die zählt: Blockiert das den aktuellen Weg
hinein?

## Keine ungeprüften Pakete oder Skripte
- Nur offizielle Paketquellen verwenden.
- Kein `curl | bash` oder `wget | sh`, ohne das Skript vorher zu inspizieren.
- Keine PPAs oder Repositories aus unbekannten Quellen.
- Bei Fremd-Repos den GPG-Schlüssel und die Quelle verifizieren.

## Vor kritischen Änderungen sichern
Vor dem Ändern dieser Dateien sichern (`cp {file} {file}.bak.{YYYYMMDD}`): `/etc/ssh/sshd_config`,
Firewall-Regeln, sudoers-Dateien, Dienst-Konfigurationen unter `/etc/`.

## Dateiberechtigungen
- Niemals `777` auf Systemdateien. Kein einziges Mal.
