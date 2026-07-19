---
name: setup
description: >
  Bringt einen neuen Server von Grund auf hoch: Werkzeuge, Härtung, Sicherung und wahlweise Docker, in
  der richtigen Reihenfolge und mit den Entscheidungen vorweg. Starte es, indem du
  /callbell-sysadmin:setup tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Einen neuen Server aufsetzen: der Ablauf

Dieser Skill führt die **vollständige Erstinbetriebnahme** eines Servers. Er ist der Taktgeber; die
Einzelschritte liegen in den Begleitdateien dieses Ordners und in den eigenständigen Skills
`callbell-sysadmin:harden`, `callbell-sysadmin:backup` und `callbell-sysadmin:deploy` (jeden bei Bedarf
laden, nicht auf Vorrat).

> Läuft auf dem neuen Server als Admin-Benutzer, nicht als root. Vor zerstörenden Schritten gelten die
> Sicherheitsregeln (Zwei-Verbindungs-Muster für SSH und Firewall).

## Phase 0: Entscheidungen sammeln (im Planmodus, VOR der Ausführung)

Diese Parameter tragen jeden späteren Schritt. **Frag aktiv**, nimm nichts an. Der Normalfall ist
Ubuntu/Debian, aber der Server kann anders sein:

1. **Distribution, Init-System, Paketmanager.** Etwa Ubuntu/Debian (`apt`, `systemd`, `ufw`),
   Fedora/RHEL (`dnf`, `systemd`, `firewalld`), Alpine (`apk`, OpenRC). Unklar: `cat /etc/os-release`,
   `ps -p1 -o comm=`. Bestimmt die Befehle für Pakete, Firewall und Timer.
2. **Servertyp und Zweck.** Beeinflusst Firewall-Werkzeug, automatischen Neustart und ob Docker
   eingerichtet wird.
3. **Git-Authentisierung.** PAT (Normalfall), Deploy-Key oder Konto-SSH-Schlüssel (Details: `git-auth.md`).
4. **Werkzeuge.** Den Standardsatz bestätigen lassen (`micro`, `mc`, `fzf`, `tmux`, `git`).
5. **Docker-Server?** Wenn ja, laufen `callbell-sysadmin:deploy` und die Datenbank-Dumps am Ende.

Entscheidungen zu Härtung und Sicherung fallen hier **nicht**: Firewall, SSH-Port und automatischer
Neustart klärt `callbell-sysadmin:harden`, die Sicherungsparameter (Ziel, Zeitfenster, Benachrichtigung)
klärt `callbell-sysadmin:backup`, jeweils im Planmodus des eigenen Skills. Halte die Entscheidungen in der
Domäne dieses Hosts fest.

## Phase 1: Arbeitsordner und Host-Identität

**Das macht dieser Skill nicht selbst.** Ruf `/callbell-sysadmin:start` auf und lass ihn laufen: er prüft
das Gerüst, liefert die Vorlagen aus, legt die Domäne `<host>/` mit `framework.md` und `index.md` an, liest
den Bestand der Maschine aus und setzt `__callbell__/.host-identity`.

Der Grund für die Trennung ist der Fehler, der sie nötig gemacht hat: eine Maschine bereitstellen und einen
Arbeitsordner einrichten sind zwei Aufgaben, und solange sie eine waren, entstand die Domäne nie. Sie wird
auch dann gebraucht, wenn niemand je einen Server von Grund auf aufsetzt.

Ab der nächsten Sitzung nennt der Hook diese Domäne als Arbeitsbereich und aktiviert die passive
Sicherheitsschicht.

## Phase 2: Basis

- **Admin-Benutzer** mit sudo (nie als root arbeiten); SSH-Schlüssel hinterlegen.
- **Git global einrichten:** `user.name`, `user.email`, `init.defaultBranch main`, `pull.rebase false`.

## Phase 3: Werkzeuge installieren

Siehe die Begleitdatei `tools.md` (`micro`, `mc`, `fzf`, `tmux`, `git`, Installation über mehrere
Distributionen hinweg plus `tmux.conf`).

## Phase 4: Härtung

Lade den Skill `callbell-sysadmin:harden` und führe ihn aus (SSH, Firewall, fail2ban, Benutzer, System;
distributionsbewusst, mit Entscheidungspunkten). Halte jede Abweichung von der Baseline in der Domäne
dieses Hosts fest, mit ihrem Grund.

## Phase 5: Sicherung

Lade den Skill `callbell-sysadmin:backup` und führe ihn aus (Borg/Borgmatic auf ein entferntes Ziel,
Benachrichtigung, Zugangsdaten, versetzte Startzeit, Wiederherstellungstest).

## Phase 6: Docker (nur auf Docker-Servern)

Lade den Skill `callbell-sysadmin:deploy` für die Stack-Konventionen; die Datenbank-Dumps werden über
`callbell-sysadmin:backup` und dessen Begleitdatei `db-dumps.md` vor der Sicherung eingehängt.

## Phase 7: Abnahme

Geh die Abnahmeliste von `callbell-sysadmin:harden` Punkt für Punkt durch und halte das Ergebnis in der
Domäne dieses Hosts fest. Prüfe die erste Sicherung und einen Wiederherstellungstest.
