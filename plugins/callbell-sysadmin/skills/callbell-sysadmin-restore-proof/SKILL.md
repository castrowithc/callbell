---
name: callbell-sysadmin-restore-proof
description: >
  Beweist, dass eine Sicherung wiederherstellbar ist, statt nur zu prüfen, ob sie läuft: drei
  eskalierende Restore-Stufen in einen Scratch-Pfad, jede sagt, was sie belegt und was offen bleibt.
  Deckt auch den Fall ganz ohne Sicherung ab. Starte es, indem du /callbell-sysadmin-restore-proof tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Wiederherstellung beweisen, nicht nur laufen lassen

`callbell-sysadmin-backup` richtet die Sicherung ein, `callbell-sysadmin-checkup` prüft, ob der Timer
feuert, wie der letzte Lauf ausging und wie alt das neueste Archiv ist. Das alles misst den Vorgang, keines
davon misst die Sicherung selbst. Ein feuernder Timer und ein wachsendes Archiv sind mit einer Sicherung
vereinbar, die sich nicht zurückholen lässt: ein ausgeschlossener Pfad, den niemand bemerkt hat, eine
Datenbank, die während des Schreibens gesichert wurde, eine Passphrase, die nur auf der gesicherten Maschine
liegt, ein Schlüssel, der mit dem Host verloren ging. Jeder dieser Fälle ist unsichtbar bis zu dem Tag, an
dem er zählt, und an diesem Tag ist er nicht mehr behebbar.

Dieser Skill schließt die Lücke mit einem Verfahren. Er stellt **nie über Live-Daten** wieder her, sondern
immer in einen Scratch-Pfad, und räumt danach auf. Eine Wiederherstellung an Ort und Stelle zu erproben ist
der Weg, wie aus einer schlechten Sicherung ein schlechter Ausfall wird, und die Sicherheitsschicht des
Packs behandelt das Überschreiben von Live-Pfaden ohnehin als zerstörend.

## Zuerst verzweigen: gibt es eine Sicherung?

- **Ja, eine laufende Sicherung** (borgmatic/Borg nach `callbell-sysadmin-backup`, oder ein anderes
  Verfahren): weiter mit den drei Stufen.
- **Nein, oder keine, der jemand traut**: weiter mit dem Abschnitt "Kein Backup" unten. Das ist ein
  erstklassiger Pfad, kein Fehler.

Lies zuerst, was über den Host festgehalten ist (Ordner `<host>/`, Abschnitt Sicherung in der `index.md`):
was gesichert wird, wohin, und welche Stufe zuletzt bewiesen wurde. Das sagt dir, wo du ansetzt und was noch
nie geprüft wurde.

## Die drei Stufen: eskalierend

Ein Beweis ist umso mehr wert, je näher er an einem echten Verlust sitzt. Darum wird eskaliert, statt eine
Stufe zu wählen. Jede Stufe baut auf der davor. Alles wird nach `/tmp/restore-proof/` (oder einem anderen
Scratch-Pfad) zurückgeholt, nie an den Ursprungsort.

| Stufe | Was sie zurückholt | Was sie belegt | Was sie **nicht** belegt |
|---|---|---|---|
| 1 | eine einzelne Datei, Hash gegen das Original | Archiv lesbar, Passphrase richtig, Speicherpfad erreichbar | nichts über Ausschlüsse oder Datenbanken |
| 2 | ein Verzeichnis, das zählt, mit Rechten und Eigentümer, Diff gegen die Live-Kopie | dass die wichtigen Pfade wirklich im Archiv sind (stille Ausschlüsse werden sichtbar) | nichts über inneren Datenbankstand |
| 3 | eine Datenbank aus dem Dump in eine Scratch-Instanz, eine Abfrage darauf | dass der Dump konsistent und einspielbar ist | nur so viel wie die eine geprüfte Datenbank |

### Stufe 1: eine einzelne Datei

Hol eine Datei aus dem neuesten Archiv in den Scratch-Pfad und vergleiche sie mit dem Original (Beispiel für
Borg; bei anderem Verfahren das Gegenstück):

```bash
mkdir -p /tmp/restore-proof && cd /tmp/restore-proof
sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract --strip-components 0 ssh://<benutzer>@<ziel-host>/./borg::<ARCHIV> etc/hostname
sudo cmp /etc/hostname /tmp/restore-proof/etc/hostname && echo "Stufe 1: OK"
```

Scheitert das hier, sind Archiv, Passphrase oder Speicherpfad kaputt, und das ist das meiste von dem, was
schiefgeht. Wähle eine kleine, stabile Datei, die sich sicher vergleichen lässt.

### Stufe 2: ein Verzeichnis, das zählt

Hol ein Verzeichnis zurück, das im Ernstfall gebraucht wird (etwa `/etc/` einer Anwendung oder ein
Konfigurationsbaum), mit Rechten und Eigentümer, und diffe es gegen die Live-Kopie:

```bash
sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<benutzer>@<ziel-host>/./borg::<ARCHIV> etc/<pfad>
sudo diff -r --brief /etc/<pfad> /tmp/restore-proof/etc/<pfad>
sudo ls -la /tmp/restore-proof/etc/<pfad>   # Rechte und Eigentümer prüfen
```

Hier sitzen die Überraschungen, weil der Diff zeigt, was **nicht** im Archiv ist. Jede Datei, die live da
ist und im Restore fehlt, ist ein stiller Ausschluss und ein Befund. Rechte oder Eigentümer, die nicht
stimmen, machen einen echten Restore unbrauchbar, auch wenn die Bytes da sind.

### Stufe 3: eine Datenbank

Nur bei einem Host mit Datenbank-Dumps (Docker-Server, `db-dumps.md`). Hol einen Dump in den Scratch-Pfad,
spiele ihn in eine **Scratch-Instanz** ein (nie in die Live-Datenbank), und stell eine Abfrage:

```bash
# Dump aus dem Archiv holen
sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<benutzer>@<ziel-host>/./borg::<ARCHIV> root/backup/borg/db-dumps/<container>.sql

# Scratch-Instanz starten (Beispiel PostgreSQL), einspielen, eine Abfrage, danach entfernen
docker run -d --rm --name restore-proof-db -e POSTGRES_PASSWORD=scratch postgres:16
sleep 5
docker exec -i restore-proof-db psql -U postgres \
  < /tmp/restore-proof/root/backup/borg/db-dumps/<container>.sql
docker exec restore-proof-db psql -U postgres -c '\dt'   # Tabellen da? eine echte Abfrage stellen
docker stop restore-proof-db
```

Ein Dump, der während Schreibvorgängen gezogen wurde, scheitert genau hier und an keiner früheren Stufe.
Die Scratch-Instanz ist wegwerfbar und berührt die Live-Datenbank nie.

### Nach jeder Stufe: sagen, was offen bleibt

Wer nur Stufe 1 gelaufen ist, hat seine Datenbank **nicht** bewiesen, und das gehört klar gesagt, nicht als
grünes Ergebnis kaschiert. Nenne die erreichte Stufe und die nächste, die noch aussteht.

## Kein Backup: was zuerst schützen

Gibt es nichts, ist die Frage nicht "richte eine Sicherung ein" allein, sondern was sich **jetzt** schützen
lässt, in welcher Reihenfolge, mit dem, was da ist. Die Reihenfolge folgt der Unersetzbarkeit, nicht der
Größe:

1. **Daten, die nirgends sonst existieren** (Nutzerinhalte, Datenbanken) schlagen alles Neuinstallierbare.
2. **Konfiguration, die einen Tag Arbeit war**, ist mehr wert als die Pakete, die sie konfiguriert.
3. **Flüchtiger Dienststand** (nur im Speicher oder in einem Container-Volume) ist am leichtesten verloren
   und am wenigsten bemerkt.

Wo heute keine vollständige Sicherung möglich ist, sag, was eine teilweise kauft und was sie offen lässt,
statt alles unterhalb von vollständig als Fehlschlag zu behandeln. Ein `pg_dumpall` in einen ausgelagerten
Speicher heute Abend ist mehr als das perfekte Konzept nächste Woche.

## Aufräumen und Sicherheit

- **Nie den Live-Pfad berühren**, auf keiner Stufe. Restore nur nach `/tmp/restore-proof/`, Datenbank nur in
  eine Scratch-Instanz.
- **Scratch danach entfernen:** `sudo rm -rf /tmp/restore-proof` und die Scratch-Datenbank stoppen. Ein
  zurückgeholter Dump enthält Klartext-Anwendungsdaten, er darf nicht liegen bleiben.
- **Keine Geheimnisse ausgeben:** Passphrase und Schlüssel werden gelesen, nie ins Protokoll oder in den
  Chat geschrieben (Sicherheitsschicht des Packs).

## Festhalten

Das Ergebnis gehört in das Material des Hosts (`<host>/index.md`, Abschnitt Sicherung), mit Datum und
erreichter Stufe, damit ein späterer Lauf sieht, was nie bewiesen wurde. Zwei Zeilen genügen, das ist kein
Bericht:

```
Restore-Beweis 2026-07-21: Stufe 2 bestanden (Datei + Verzeichnis /etc/nginx, Rechte/Eigentümer ok).
Offen: Stufe 3 (Datenbank) noch nie bewiesen.
```

`callbell-sysadmin-checkup` liest diese Zeilen bei seinem Rundgang und meldet, wenn der letzte Beweis alt
ist oder eine Stufe nie erreicht wurde.
