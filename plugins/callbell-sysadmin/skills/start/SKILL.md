---
name: start
description: >
  Der Einstieg in callbell-sysadmin: legt den Arbeitsordner für Server an oder ergänzt eine weitere
  Host-Domäne daneben, liest den Bestand des Hosts selbst aus und setzt die Host-Identität. Starte es,
  indem du /callbell-sysadmin:start tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-sysadmin:start

Die erste Station in einem Server-Arbeitsordner. Der Hook sagt jeder Sitzung, welche Domäne ihr
Arbeitsbereich ist — dieser Skill ist das, was die Domäne anlegt.

**Eine Domäne ist ein Ordner, benannt wie der Host, und liest sich wie ein kleines eigenes Repo ohne
eigenes Git:** alles über diese Maschine liegt darin, und `__callbell__/` ist die einzige gemeinsame
Mitte. Sie trägt `framework.md` (wie auf dem Host gearbeitet wird) und `index.md` (was auf ihm steht) und
wächst faul weiter: Neues kommt in eine bestehende Datei, wo eine passt, und wird sonst eine neue darunter.

**Er läuft normalerweise auf dem Host selbst**, weil dort der Agent läuft. Die Ausnahme ist der Nutzer,
der von der eigenen Maschine aus per Fernwartung arbeitet — dazu Schritt 5.

**Die Regel, an der dieser Skill hängt: melde nur, was fehlt.** Eine Prüfung, die Erfolg meldet, ist
Lärm. In einem eingerichteten Ordner ist ein Lauf eine Zeile.

## 1. Abhängigkeiten (still, wenn erfüllt)

Dieses Pack setzt den Kern voraus, und der Kern legt `__callbell__/`. Prüfe deshalb zuerst, ob das Gerüst
steht. Fehlt es, ist das kein Fehler dieses Skills: ruf `/callbell:start` auf, lass ihn seine Arbeit tun,
und mach danach hier weiter. Steht es, sag dazu nichts.

Das gilt auch, wenn jemand später einmal direkt zu einem Sweep greift, ohne je hier gewesen zu sein: die
Prüfung findet statt, sie spricht nur nicht, solange nichts zu tun ist.

## 2. Verzweigen auf das, was du vorfindest

Es gibt genau zwei Fälle, und du erkennst sie daran, ob neben `__callbell__/` schon eine Host-Domäne liegt:

- **Noch keine Domäne** — der Ordner ist neu für diesen Zweck. Lege das Ganze an: Vorlagen ausliefern
  (Schritt 3), erste Domäne, Ruleset im Root (Schritt 6).
- **Mindestens eine Domäne da** — es kommt eine dazu. **Fass die bestehenden nicht an.** Weder ihre
  Dateien noch ihre Struktur; die zweite Domäne entsteht daneben, und wenn dabei an der ersten etwas
  auffällt, ist das eine Bemerkung an den Nutzer und keine Änderung.

## 3. Vorlagen ausliefern

Kopiere `${CLAUDE_PLUGIN_ROOT}/templates/` nach `__callbell__/templates/plugin-callbell-sysadmin/`,
und zwar nur, was dort fehlt. Nie vergleichen, nie überschreiben: was der Nutzer angepasst hat, gehört ihm.

Die Trennung dahinter ist die, die dieses Pack überhaupt einhalten kann. **Was ein Plugin ausliefert, ist
per Definition allgemein** — es kann nichts über einen Host wissen, den es nie gesehen hat. Deshalb:

- allgemein und mitgeliefert → `__callbell__/templates/plugin-callbell-sysadmin/`
- von einem konkreten Host geformt → `<domäne>/templates/`

Das ist zugleich der Weg für Skripte, die man kopiert und anpasst: die allgemeine Fassung wird von links
gelesen, die angepasste nach rechts geschrieben. **Kein Plugin schreibt je in den Vorlagenordner einer
Domäne.**

## 4. Die Domäne anlegen

Frag nach dem Namen nur, wenn du ihn nicht lesen kannst — auf dem Host ist er der Hostname (`hostname`).
Bestätigen lassen genügt.

```
<host>/framework.md   aus host-framework.md
<host>/index.md       aus host-index.md
```

Beim Kopieren umbenennen: die Vorlagen tragen ihr Ziel als Suffix, damit sie nicht selbst als Knoten
gelesen werden, und dürfen den reservierten Namen deshalb nie schon im Vorlagenordner tragen.

**Den Bestand liest du aus, du erfragst ihn nicht.** Alles in `index.md` außer dem Zweck steht auf der
Maschine, und den Nutzer danach zu fragen kostet ihn Zeit für etwas, das ein Befehl weiß:

```bash
hostname; cat /etc/os-release; ps -p1 -o comm=; uname -r
lscpu | head -20; free -h; df -h /
ip -brief addr; ss -tlnp 2>/dev/null | head -30
command -v docker >/dev/null && docker ps --format '{{.Names}}\t{{.Image}}'
```

Alles billig und lesend. Nichts davon durchsucht das Dateisystem, und nichts davon ändert etwas.

Was du **nicht** hineinschreibst: Schlüssel, Passwörter, Tokens, Inhalte von `.env`-Dateien. Die
Datenschutznorm des Kerns gilt hier unverändert, und der Ordner kann eines Tages öffentlich sein.

## 5. Die Host-Identität setzen

Eine Zeile, und sie entscheidet, was der Hook in jeder folgenden Sitzung tut:

```bash
echo "<domänenordner>" > __callbell__/.host-identity
```

**Der Inhalt ist der Ordnername, nicht der Hostname.** Das ist der ganze Grund für diese Schreibweise:
ändert sich der Hostname, benennt man den Ordner um und diese eine Zeile mit, und sonst nichts im Repo.

Drei Zustände, und der mittlere ist der, den man leicht übersieht:

| `.host-identity` | Bedeutung |
|---|---|
| fehlt | kein Serverkontext, nichts Serverspezifisches lädt |
| da, leer | der Nutzer arbeitet von der eigenen Maschine aus per Fernwartung; Sicherheitsschicht lädt, keine Domäne |
| da, mit Inhalt | der Agent läuft auf dem Host; der Inhalt ist die Domäne |

**Arbeitet der Nutzer von seiner eigenen Maschine aus**, legst du die Datei leer an. Die Domänen der
verwalteten Hosts liegen trotzdem im Ordner — nur ist keine davon *die* aktuelle, denn welcher Host
gemeint ist, sagt der Nutzer im Gespräch. Die Sicherheitsschicht lädt in diesem Fall genauso, weil per SSH
dieselben zerstörenden Befehle laufen wie vor Ort.

## 6. Zweck und Ruleset (einmalig)

Zwei Dinge sind nicht auslesbar, und nur nach denen fragst du:

1. **Wofür dieser Host da ist** — ein bis drei Sätze, in `framework.md`. Ohne ihn ist die Domäne ein
   Bestandsverzeichnis ohne Sinn.
2. **Was das Ruleset noch nicht sagt.** Erst lesen, dann fragen. Stehen Zweck und Rollen des Ordners schon
   in `AGENTS.md` oder `CLAUDE.md`, fragst du nichts; danach zu fragen sagt dem Nutzer, dass du seine Datei
   nicht gelesen hast.

Fehlt das Ruleset ganz, leg es aus `server-agents.md` an, mit der `CLAUDE.md` daneben als einzeiliger
Weiche `@AGENTS.md` — dieselbe Mechanik wie im Kern, damit beide Hosts denselben Inhalt lesen, ohne ihn
zu doppeln. Ergänzt wird immer durch **Anhängen, nie durch Ersetzen**, und geschrieben erst nach
Bestätigung: die Datei gehört dem Nutzer.

## 7. Abschluss

Zwei Zeilen, in der Sprache des Nutzers, mit Namen statt Fließtext:

```
✅ Angelegt: web01/ (framework.md, index.md), __callbell__/.host-identity
❗ Fehlt: Zweck des Hosts in web01/framework.md
```

Was schon da war, steht nirgends. Sag zum Schluss, dass die Domäne ab der **nächsten** Sitzung als
Arbeitsbereich gilt, weil der Hook beim Start liest — in dieser hier kennst du sie, aber der Hook hat sie
noch nicht angesagt.

War nichts zu tun, ist der Abschluss eine Zeile.

**Eine Zeile mehr, aber nur auf einer frischen Maschine.** Du hast in Schritt 4 den Bestand gelesen und
weißt damit, was du vor dir hast. Zeigt er kein Admin-Konto neben root, keine Firewall, keinen der
Standard-Werkzeuge und keinen Sicherungs-Timer, dann steht hier eine unfertige Maschine, und du nennst
`/callbell-sysadmin:setup` als den Weg, sie vollständig hochzubringen.

**Nur dann.** Auf einem eingerichteten Server erscheint dieser Hinweis nicht — ein Zeiger, der immer feuert,
ist Werbung, und er widerspricht der Regel dieses Skills, dass ein Lauf ohne Befund eine Zeile ist. Im
Zweifel lässt du ihn weg: wer eine frische Maschine hat, merkt es auch ohne dich, wer eine laufende hat,
wird von einem Angebot zur Erstinbetriebnahme nur beunruhigt.
