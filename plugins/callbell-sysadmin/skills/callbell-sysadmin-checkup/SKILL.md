---
name: callbell-sysadmin-checkup
description: >
  Regelmäßiger Rundum-Check eines Servers: System (Kernel, Neustart, Platte, Zeit, Ressourcen), offene
  Updates, Abweichungen von der Härtung, Lebendigkeit der Sicherung, verglichen mit dem, was über den Host
  festgehalten ist, als datierter Bericht. Für die Routinefrage "läuft noch alles rund". Starte es, indem
  du /callbell-sysadmin-checkup tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Server-Checkup: Rundgang, Abweichung, Bericht

Regelmäßige Prüfung eines bereits eingerichteten Servers. **Nur lesend** plus ein Bericht, die
Systemkonfiguration wird **nicht** verändert. Befunde werden gemeldet und nur auf Wunsch behoben.

**Abgrenzung, damit hier nichts doppelt steht:** Die Zielwerte der Härtung (SSH, Firewall, fail2ban,
Benutzer) legt `callbell-sysadmin-harden` fest, den Aufbau der Sicherung `callbell-sysadmin-backup`. Dieser
Skill **prüft** den laufenden Zustand gegen diese Baseline und gegen das, was über den Host festgehalten
ist; er definiert die Baseline nicht neu. Für eine tiefere Prüfung oder erneutes Härten lade
`callbell-sysadmin-harden`. Bei einem Host, von dem du vermutest, dass jemand daran war, stellt
`callbell-sysadmin-incident` genau diese Frage.

## Vorgehen

1. **Identität und Sollzustand laden.** Die beim Sitzungsstart genannte Domäne (Ordner `<host>/`) hält
   fest, was über diesen Server bekannt ist: `framework.md`, wie er betrieben wird, `index.md`, was auf ihm
   steht, samt der Einträge zu Härtung und Sicherung. Das ist die Vergleichsgrundlage für den Rundgang. Die
   allgemeinen Zielstandards für Härtung und Sicherung liegen in den Skills `callbell-sysadmin-harden` und
   `callbell-sysadmin-backup`. Ein früherer Bericht in der Domäne dient als Formatvorlage.
2. **Den Rundgang laufen lassen.** Führ die Begleitdatei `checkup.sh` dieses Skill-Ordners aus (nur lesend,
   erhebt alle Kennzahlen in einem Durchgang):
   ```bash
   sudo bash checkup.sh
   ```
   Abweichungen bei Distribution und Werkzeugen fängt das Skript ab (`command -v`-Wächter); auf Servern
   ohne systemd oder ohne UFW ergänzt du die fehlenden Blöcke von Hand mit dem Gegenstück der Distribution
   (firewalld/nftables, Plesk-Firewall, cron statt Timer).
3. **Gegen den Sollzustand vergleichen (Abweichung).** Vergleich jeden Block mit dem, was über Sicherheit
   und Sicherung dieses Servers festgehalten ist, und mit dem allgemeinen Standard
   (`callbell-sysadmin-harden`/`callbell-sysadmin-backup`). Jede Abweichung ist ein Befund. Typisch: ein
   geänderter SSH-Wert, ein inaktives Jail, ein abgeschalteter Timer, ein Archiv älter als ein Intervall,
   eine Schwelle bei der Plattenbelegung, laufender Kernel ungleich neuestem installiertem ohne Neustartplan,
ein Restore-Beweis, der nie über Stufe 1 kam oder seit einem Vierteljahr nicht erneuert wurde.
4. **Bewerten.** Je Befund eine Schwere und ob Handlungsbedarf besteht. Sicherheitsupdates aus der
   Freigabeliste von unattended-upgrades (`*-security`) sind **kein** Befund, solange u-u aktiv ist, sie
   werden automatisch eingespielt; erwähne sie nur.
5. **Den Bericht schreiben.** Eine neue, datierte Berichtsdatei in der Domäne dieses Hosts
   (`type: knowledge`, `edit: shared`). Aufbau siehe unten. **Keine Geheimnisse** im Bericht (Webhook-
   Adressen, Schlüssel und IPs sparsam).
6. **Mit Befunden umgehen.** Behebe nur nach ausdrücklicher Freigabe. Die festgehaltenen Tatsachen und der
   Rahmen des Hosts sind `edit: locked`; nach einer Behebung aktualisierst du die betroffene Datei oder die
   Prüfhistorie des Hosts nur **auf Anweisung**.

## Was geprüft wird

| Bereich | Kennzahlen |
|---|---|
| System | Laufzeit; laufender gegen neuesten installierten Kernel; `reboot-required`-Merker; Zeitzone und NTP-Abgleich; Belegung von `/` |
| Ressourcen | RAM- und Swap-Belegung; die stärksten CPU- und RAM-Prozesse |
| Dienste | laufende Dienste, verglichen mit den festgehaltenen Diensten (unerwartet oder fehlend ist ein Befund) |
| Updates | offene insgesamt; davon `*-security`; zurückgehaltene Pakete; letzter u-u-Lauf |
| SSH | wirksame Werte über `sshd -T` (RootLogin, PasswordAuth, MaxAuthTries, LoginGraceTime, ClientAlive*, X11, AllowUsers, Port) |
| Firewall | UFW-Status und offene Ports (oder firewalld/nftables) |
| fail2ban | aktive Jails; `dbpurgeage`; aktuell und insgesamt gesperrt je Jail |
| Benutzer | Konten mit UID 0 außer root; Mitglieder von sudo/wheel |
| Anmeldungen | jüngste Anmeldungen; fehlgeschlagene SSH-Anmeldungen und häufigste Quell-IPs |
| Systemupdates | `unattended-upgrades` aktiv; Zeit für automatischen Neustart |
| Sicherung | `borgmatic.timer` aktiv und nächster Lauf; Ergebnis des letzten Laufs; neuestes Archiv und Lückenprüfung; Alter des letzten Restore-Beweises und höchste je erreichte Stufe (aus dem Material des Hosts, `callbell-sysadmin-restore-proof`) |

`/etc/shadow` wird bewusst **nicht** gelesen (Sicherheitsregel); eine Prüfung auf leere Passwörter nur auf
ausdrückliche Anforderung. Tiefere Forensik (authorized_keys über alle Benutzer, Prüfung von cron und Units,
rekursive Suche nach Dateiänderungen, Prozesse und ausgehende Verbindungen) gehört nicht in diesen Rundgang,
weil sie eine andere Frage beantwortet. Sieht hier etwas danach aus, als sei jemand auf dem Host gewesen,
ist das der Verdachtspfad: `callbell-sysadmin-incident`.

## Aufbau des Berichts

```markdown
---
description: >
  Server-Checkup-Bericht JJJJ-MM-TT: Rundum-Check, Momentaufnahme des Ergebnisses.
type: knowledge
edit: shared
created: JJJJ-MM-TT
updated: JJJJ-MM-TT
---

# Server-Checkup: JJJJ-MM-TT

## Zusammenfassung
<1 bis 3 Sätze: Gesamtbild, Zahl der Befunde, Abweichung ja/nein.>

## System
### [OK|INFO|BEFUND|BEHOBEN] <Titel>
- <Befund mit Zahl oder Beleg>

## Härtung
...

## Sicherung
...

## Offene Punkte
- [ ] <was aussteht, mit Datum oder Bedingung>, oder "Keine."
```

Marker: `[OK]` konform · `[INFO]` erwähnenswert, kein Handlungsbedarf · `[BEFUND]` Abweichung noch offen ·
`[BEHOBEN]` in dieser Sitzung korrigiert.
