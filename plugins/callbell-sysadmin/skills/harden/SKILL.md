---
name: harden
description: >
  Härtet einen Server auf eine Sicherheits-Baseline oder prüft eine bestehende Härtung: SSH, Firewall,
  fail2ban, Benutzer, System. Starte es, indem du /callbell-sysadmin:harden tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Einen Server härten: Baseline und Vorgehen

Beschreibt den **Zielzustand** und nicht bloß feste Befehle, damit die Härtung über Distributionen hinweg
trägt. Halte jede Abweichung in der Domäne dieses Hosts fest, mit ihrem Grund. Für die Abnahme geh
`checklist.md` in diesem Skill-Ordner Punkt für Punkt durch.

## Planmodus: zuerst entscheiden

- **Distribution, Init, Paketmanager.** Bestimmt das Firewall-Werkzeug (UFW / firewalld / nftables / ein
  Panel wie Plesk), den Mechanismus für automatische Updates und das Timer-System (systemd / cron / OpenRC).
- **SSH-Port:** ändern oder auf dem Standard lassen (die bewusste Wahl festhalten).
- **Firewall-Werkzeug** je Server (siehe unten).
- **Automatischer Neustart** ja oder nein (nur unkritische Server, zeitlich nach dem Sicherungsfenster).
- **fail2ban-Jails** hängen von den laufenden Webdiensten ab; die `ignoreip`-Adressen sind serverspezifisch.

## SSH (Zielwerte)

| Einstellung | Ziel |
|---|---|
| PermitRootLogin | `no` |
| PasswordAuthentication | `no` |
| PubkeyAuthentication | `yes` |
| MaxAuthTries | `3` |
| LoginGraceTime | `30s` (Standard 120s; kürzeres Fenster für Brute Force) |
| ClientAliveInterval | `300` |
| ClientAliveCountMax | `3` |
| X11Forwarding | `no` (Server laufen üblicherweise ohne Anzeige) |
| AllowUsers | nur die tatsächlich benötigten Benutzer (verwaiste Einträge entfernen) |

Syntax prüfen (`sshd -t`), dann `systemctl reload ssh`/`sshd` (reload, nicht restart).

## Firewall

- **Server-Firewall aktiv**, nur die benötigten Ports offen. Werkzeug je Server:
  - Standard Debian/Ubuntu: **UFW** (`ufw status`).
  - Fedora/RHEL: **firewalld**; minimal: **nftables**.
  - Panel-Server (etwa Plesk): die Firewall des Panels (UFW/iptables nicht direkt verwalten).
- **Provider- oder Host-Firewall** als zusätzliche äußere Schranke (etwa Hetzner Cloud, IONOS).
- Standardports: SSH (wie konfiguriert), HTTP 80, HTTPS 443.
- **Docker-Server:** UFW kann Docker nicht steuern (Docker greift direkt in iptables ein). Ports an
  `127.0.0.1` binden und die Provider-Firewall als äußere Schranke nutzen.
- Halte Werkzeug und Ports konkret in der Domäne dieses Hosts fest.

## fail2ban

| Jail | Pflicht | bantime | findtime | maxretry | Anmerkung |
|---|---|---|---|---|---|
| sshd | ja | >= 1h | Standard | 3 | SSH-Brute-Force |
| recidive | ja | **dauerhaft (`-1`)** | **1 Woche** | 3 | Wiederholungstäter, alle Ports (iptables-allports) |
| dienstspezifisch | wenn ein Webdienst läuft | >= 1h | | 3 | etwa `caddy-auth` (Docker), Panel-Jails |

**Dauerhafte Sperren überdauern lassen:** in `/etc/fail2ban/fail2ban.local` ist das Pflicht:

```
[DEFAULT]
dbpurgeage = 365d
```

Der Standard `1d` räumt Einträge nach 24 Stunden aus der Datenbank, dauerhafte Sperren (`bantime = -1`)
überleben einen Neustart also **nicht**. Mit `365d` bleiben sie ein Jahr bestehen.

**Eskalation:** 3 fehlgeschlagene SSH-Versuche, sshd-Jail (ausgesperrt); 3 Sperren in einer Woche,
recidive, dauerhaft auf allen Ports; Sperren überstehen Neustarts über `fail2ban.sqlite3`.

**Whitelist (`ignoreip`)** mindestens: `127.0.0.0/8`, `::1`, die **eigene öffentliche IP des Servers**
(Schutz davor, sich selbst auszusperren), wahlweise vertrauenswürdige Quell-IPs. Halte die konkreten
Adressen in der Domäne dieses Hosts fest.

> Auf Distributionen ohne iptables (nftables/firewalld) die passende `banaction` für fail2ban wählen
> (`nftables-allports` statt `iptables-allports`).

## Benutzer

- Keine direkte root-Anmeldung (weder per SSH noch passwortloses sudo für kritische Vorgänge).
- Ein eigener Admin-Benutzer (nie `root` als Arbeitsbenutzer).
- Ein Monitoring-Benutzer für externe Werkzeuge (ohne sudo).

## System

- **Automatische Sicherheitsupdates** (nur Sicherheit, keine Funktionsupdates). Debian/Ubuntu:
  `unattended-upgrades`; Fedora/RHEL: `dnf-automatic` (security); sonst das Gegenstück der Distribution.
- **Automatischer Neustart:** standardmäßig nein (manuell nach Sichtung). Freiwillig für unkritische Server
  (Entwicklung, Agenten) mit einer Neustartzeit **nach** dem Sicherungsfenster (etwa Sicherung 03:00,
  Neustart 04:00). Produktions- und Kundenserver bleiben manuell. Die Wahl je Server festhalten.
- **Zeitzone:** die Zeitzone des Betreibers setzen, NTP aktiv. Der VPS-Standard ist oft `Etc/UTC`; ändern
  mit `sudo timedatectl set-timezone <Gebiet/Stadt>`.
  Achtung: **systemd-Timer** mit `OnCalendar=HH:MM:SS` (ohne Zeitzonen-Suffix) laufen in der Zeitzone des
  Systems, nach einer Änderung verschiebt sich also die Laufzeit. Zieh Healthcheck- und
  Monitoring-Erwartungen nach (etwa den Heartbeat eines Uptime-Monitors).
- **Log-Rotation** eingerichtet.

## Docker (nur auf Docker-Servern)

- Log-Rotation für Docker eingerichtet.
- Aufbau und Konventionen der Stacks: Skill `callbell-sysadmin:deploy`.
