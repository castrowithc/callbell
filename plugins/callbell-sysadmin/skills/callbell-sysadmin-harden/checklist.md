---
description: >
  Begleitdatei zu callbell-sysadmin-harden: eine Prüfliste für neue und bestehende Server (Abnahme und
  Nachprüfung). Halte den Stand je Server in dessen Domäne fest.
type: playbook
edit: locked
---

# Prüfliste Härtung

> Für neue Server und regelmäßige Nachprüfungen. Befehle in Klammern sind Beispiele für Debian/Ubuntu mit
> systemd; auf anderen Distributionen das Gegenstück verwenden. Halte den Stand je Server in dessen Domäne
> fest.

## SSH

- [ ] PermitRootLogin = no
- [ ] PasswordAuthentication = no
- [ ] PubkeyAuthentication = yes
- [ ] MaxAuthTries <= 3
- [ ] LoginGraceTime <= 30s
- [ ] ClientAliveInterval = 300
- [ ] X11Forwarding = no
- [ ] SSH-Port geändert (oder die bewusste Entscheidung festgehalten)
- [ ] Nur die nötigen Benutzer haben SSH-Zugang (`AllowUsers`, keine verwaisten Einträge)

## Firewall

- [ ] Server-Firewall aktiv (UFW: `ufw status`; firewalld; die Firewall eines Panels)
- [ ] Nur die benötigten Ports offen
- [ ] Provider-Firewall aktiv (etwa Hetzner, IONOS) und eingerichtet
- [ ] Kein direkter Zugriff von außen auf interne Dienste

## fail2ban

- [ ] Jail `sshd` aktiv (maxretry = 3, bantime >= 1h)
- [ ] Jail `recidive` aktiv mit `bantime = -1` (dauerhaft) und `findtime = 1w`
- [ ] `dbpurgeage = 365d` in `/etc/fail2ban/fail2ban.local` gesetzt
- [ ] Die eigene öffentliche IP des Servers in `ignoreip` (Schutz davor, sich selbst auszusperren)
- [ ] Dienstspezifische Jails aktiv (Panel, Caddy- und Docker-Anwendungen und so weiter)

## Systemhärtung

- [ ] Automatische Sicherheitsupdates aktiv (`systemctl status unattended-upgrades` / `dnf-automatic`)
- [ ] Automatischer Neustart bewusst entschieden (freiwillig auf unkritischen Servern: Zeitpunkt nach dem
      Sicherungsfenster; sonst manuell)
- [ ] NTP aktiv (`timedatectl`)
- [ ] Log-Rotation eingerichtet
- [ ] Keine unnötigen Dienste laufen (`systemctl list-units --type=service --state=running`)

## Benutzer und Rechte

- [ ] Keine root-Anmeldung möglich
- [ ] Admin-Benutzer eingerichtet
- [ ] sudoers-Regeln minimal und festgehalten
- [ ] Monitoring-Benutzer ohne sudo (sofern vorhanden)

## Sicherung

- [ ] Timer der Sicherung aktiv (etwa `systemctl status borgmatic.timer`)
- [ ] Letzte Sicherung erfolgreich
- [ ] Passphrase und Schlüssel im Passwortspeicher hinterlegt
- [ ] Benachrichtigungen eingerichtet und funktionierend
- [ ] Wiederherstellungstest durchgeführt (Datum festhalten)

## Sonstiges

- [ ] SSH-Schlüssel für externe Dienste (etwa GitHub) vorhanden und mit Passphrase geschützt
- [ ] Keine Zugangsdaten in Git-Repos
- [ ] Docker-Ports auf 127.0.0.1 gebunden (falls Docker installiert ist)
- [ ] Auf Docker-Servern: die Stack-Konventionen aus Skill `callbell-sysadmin-deploy` eingehalten
