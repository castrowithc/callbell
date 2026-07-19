---
paths: ["**/*"]
description: >
  Die Normen, die in jedem callbell-Repo gelten, unabhängig von Gerüst und Typ: Namens- und
  Formatkonventionen, Datenschutz, Git-Routine, Rollen und Freigaben, Interaktionssprache, Verweise und
  Schreibstil.
type: rule
edit: locked
---

# Allgemein globale callbell Regeln

Diese Regeln ergänzen die des Nutzers und ersetzen diese NIEMALS (CLAUDE.md | AGENTS.md). Die Nutzer-Regeln gehen vor.
Manche können durch Skills die einen bestimmten Zweck verfolgen aufgeweicht oder abgelöst werden.

---

## Namen und Format: Konventionen

- Alle Namen: kebab-case, reines ASCII, keine Umlaute, keine Leerzeichen (aus Müller wird `mueller`).
  Gilt für NUR FÜR ALLE Ordner- und Dateinamen.
- Datumsformat: ISO `YYYY-MM-DD`. Chronologische Dateien dürfen mit dem Datum beginnen
  (`YYYY-MM-DD-thema.md`) und sortieren sich so von selbst richtig.

Fachliche IDs (etwa Fall- oder Kundennummern) gehören lokal zu ihrem Thema, nicht global in den Repo.

---

## Datenschutz

Behandle das Repo so, als wäre er öffentlich:
- Der versionierte Repo trägt Planung, Wissen und Struktur,
  niemals personenbezogene Rohdaten.
- Keine Personen- oder Kontaktdaten in versionierten Dateien (Namen, die an eine Person gebunden sind,
  Adressen, Telefon, E-Mail, Ausweis- oder Zahlungsdaten). Auch nicht im Gedächtnis.
- Fachliche Bezeichner bleiben lokal bei dem Thema, das sie braucht (etwa eine Fall- oder Kundennummer
  in dem Teil des Repos, dem sie gehört), nie global verstreut. Wo der Repo eine lokale Struktur für so
  eine Entität hat, legt diese Struktur fest, wie die Entität identifiziert wird.

### Eine Entität identifizieren

Wenn abgelegtes Material zu einem Kunden, Projekt oder Thema gehört, identifiziere es in dieser Reihenfolge
und teile die Wahl in jedem Fall mit:

1. Nutze den vorhandenen Bezeichner (eine Kundennummer, Fallnummer oder den eigenen Schlüssel der
   lokalen Struktur).
2. Sonst lies den laufenden Kontext: wenn das Gespräch bereits einen bestimmten Kunden, ein bestimmtes
   Projekt oder Thema im Repo betrifft, erkennt der Agent das und setzt den passenden Bezeichner.
3. Sonst frage nach, damit das Dokument richtig abgelegt und nicht geraten wird.

---

## Git-Routine

Ziel: der Repo bleibt jederzeit in einem sicheren und aufgeräumten Zustand. Der Agent geht sorgfältig mit
Git um, prüft den Zustand selbständig und meldet Ungewöhnliches, bevor er handelt.

### Session-Start (immer)

- `git fetch`, um zu sehen, was hereingekommen ist.
- `git status` und die Abweichung von `origin/main` prüfen: gibt es lokale Änderungen, ist der Branch
  voraus oder zurück, sind Konflikte wahrscheinlich?
- Wenn alles sauber und fast-forward ist: `git pull` (bevorzugt `--ff-only`). Bei Konflikten oder
  unerwarteter Abweichung nicht blind mergen, sondern erst melden.
- Uncommittete Änderungen vor dem Pull sichern (committen oder stashen), damit nichts verloren geht.

### Sicherheit

- Kein `push --force`
- Umschreiben von Historie, die bereits geteilt ist nur wenn vom Nutzer explizit gewünscht und auch nur in dem vorgegebenen Rahmen.
- NIEMALS Secrets, Zugangsdaten oder personenbezogenen Daten committen (siehe Datenschutz).
- Nie einen echten Namen oder eine echte E-Mail aus dem Harness in Commits oder Inhalten verwenden.
- Im Zweifel oder bei Konflikten anhalten und den Nutzer fragen, statt zu raten.

### Große Dateien (Binaries)

- Wenn eine stabile Binärdatei in das Repo muss, läuft sie über **Git LFS**,
  das die Datei durch einen Zeiger ersetzt und die Historie schlank hält.
- Wenn der Agent das vorschlägt, nennt er die Voraussetzungen: `git-lfs` muss auf jeder Maschine installiert
  sein. Die Pfadzuordnung lebt in `.gitattributes` und wandert mit dem Repo mit.

---

## Zusammenarbeit: Rollen und Freigaben

- Der Nutzer entscheidet und prüft, der Agent führt aus. Der Agent arbeitet strukturiert und weitgehend
  eigenständig, aber in einem Rahmen, den der Nutzer freigibt.
- Der Agent Schmückt antworten nicht unnötig aus. Er ist Fokusiert, formuliert verständlich,
  antwortet kompakt und brint die Themen auf dem Punkt. Der Nutzer fragt ggf. nach mehr Inhalt bei Unklarheit.
- Der Agent verzichtet stark auf Fett-Formatierung. Es wird nicht durch Anderes abgelöst. 

### Nur nach Freigabe

- Struktur- oder Schemaänderungen: neue Strukturelemente (Ordner, Zonen, Bereiche oder Themen), Ordner
  umbenennen oder verschieben, eine Regel lockern oder verschärfen.
- Entwürfe (`status: draft`) in den aktiven Zustand überführen.
- Löschungen und alles mit Außenwirkung.

### Sprich an: entscheiden oder fragen

- Kommunikation ist der Normalfall, nicht die Notlösung. Der Agent fragt aktiv, sobald er auf etwas
  stößt, das den Nutzer braucht. Er sitzt einen Blocker nicht aus und rät sich nicht daran vorbei.
- Wenn die Arbeit eine Entscheidung aufwirft, die der Plan nicht abgedeckt hat, ist das Kriterium nicht die
  Größe der Entscheidung, sondern ob etwas darauf aufbaut, bevor der Nutzer sie sieht. Eine falsche
  Entscheidung, auf der nichts ruht, kostet eine Bearbeitung; eine falsche Entscheidung, die zum Fundament
  wird, kostet alles, was seitdem darauf gebaut wurde.
- Entscheide und halte es fest, wenn im selben Lauf nichts davon abhängt und der Agent sicher ist,
  was der Nutzer wollen würde.
- Halte an und frage, wenn irgendetwas davon abhängt oder echter Zweifel besteht.
- Sicherheit allein reicht nie, denn ein Agent fühlt sich auch dann sicher, wenn er es nicht ist. Der Schutz
  kommt aus der Verbindung beider Bedingungen: sobald etwas auf der Entscheidung aufbaut, frage, egal wie
  sicher es sich anfühlt. Kosmetische Korrekturen sind ausgenommen.

### Erkenne das Schema, ändere es nicht von dir aus

Der Agent merkt, wenn das vorgegebene Schema nicht mehr trägt: ein Dokument passt nirgends sauber hin, ein
Ordner läuft über, eine Regel ist zu eng oder zu weit. Dann schlägt er die Anpassung vor und wartet auf
Freigabe. Er entscheidet das nie allein.

### Nachvollziehbarkeit

Ergebnisse werden so abgelegt und dargestellt, dass der Nutzer sie von Hand nachvollziehen kann:
strukturiert, aber nicht überladen.

---

## Interaktionssprache

Chat und sichtbares Reasoning folgen immer der Sprache des Nutzers. Übernimm sie aus dem, was er
schreibt, ab der ersten Nachricht.

Ein **Anker** ist das, was diese Sprache über die Session hinaus hält: eine einzelne schlichte Zeile in der
maschinenlokalen Agent-Datei des Nutzers
- Claude `~/.claude/CLAUDE.md`
- Codex `~/.codex/AGENTS.md`
 
Das ist eine Eigenschaft pro Nutzer und über alle Projekte hinweg und gehört nie in den Repo.

- Biete an, wenn der Nutzer in einer anderen Sprache als Englisch schreibt und kein Anker gesetzt
  ist: entweder meldet die Session `NO LANGUAGE ANCHOR`, oder die Datei liegt im Kontext und nennt keine
  Sprache.
- Schreibe nur nach Bestätigung, denn es ist eine Datei außerhalb des Repos. Füge die eine Zeile hinzu,
  in der Sprache des Nutzers selbst (`Antworte mir immer auf <Sprache> (Chat und sichtbares
  Reasoning).`). Keine Überschrift, kein Branding: es ist seine Datei. Lege sie an, falls sie fehlt; nennt
  sie bereits eine Sprache, ändere nichts.

---

## Verweise: wann und wie man auf andere Dateien zeigt

Jeder Verweis erzeugt Pflegelast: ändert sich ein Pfad oder ein Name, bricht er und muss überall nachgezogen werden.
Halte sie also sparsam und folge festen Regeln.

- Verweise nur auf ganze Dateien, NIE auf eine Zeile oder einen Abschnitt (das bricht bei jeder
  Änderung).
- Verweise höchstens einmal im selben Dokument auf dieselbe Datei.
- Verlinke nichts, was ohnehin immer im Kontext liegt (automatisch eingespielte Dateien); ein Zeiger
  darauf ist redundant.
- Regeln doppeln einander nicht. Jede Regel ist inhaltlich in sich geschlossen. Slugs sind stabil. Zeige nie auf Pfad, Zeile oder Abschnitt einer
  anderen Regel, und zerlege nie ein Thema künstlich, nur um es zu verlinken. Wenn etwas wirklich in eine
  Datei gehört, wird es zusammengeführt, nicht verlinkt.
- Inhalte und Doku zeigen nie auf die Meta-Ebene. Inhalts- und Dokumentationsdateien verweisen nicht auf
  Governance- oder Rahmendateien (`AGENTS.md`, Regeln, Skills). Abhängigkeiten laufen nur von der Meta-Ebene
  zum Inhalt (nach unten), nie zurück. So bricht ein Umbau der Governance keine Inhaltsdatei, und Inhalte
  bleiben in sich geschlossen.
- Lege Verweise nicht aus eigenem Antrieb an. Nur wenn die Zieldatei für die Aufgabe wirklich gebraucht
  wird. Im Zweifel kein Verweis.
- Jeder Verweis nennt seine Lesepflicht:
  - Pflichtlektüre: "Bevor du X tust, lies `datei.md`."
  - Nur bei Bedarf: "Details bei Bedarf in `datei.md`."
  - Nicht automatisch: "Nur öffnen, wenn du Y tatsächlich tust."

---

## Schreibstil beim Anlegen von Dateien

Gilt für jede Datei, die der Agent anlegt oder schreibt (Markdown, Text, Excel, PDF und so weiter), in
jedem Format. Die Antwort im Chat ist davon nicht betroffen.

- Keine Em-Dashes und En-Dashe (— | –) als Satzzeichen. Baue Sätze von vornherein so,
  dass keiner nötig ist (Punkt, Komma, Doppelpunkt). Sätze sollen natürlich und menschlich klingen.
- Deutsche Ausgabe mit echten Umlauten. Wo Deutsch erwartet wird, schreibe ä, ö, ü und ß direkt aus,
  nicht umschrieben als ae, oe, ue oder ss. Das wirk Stark unnatürlich

---

## Unterschiedliche Repo-Typen

Callbell unterscheidet zwischen Dev und Ops Projekte die der Agent kennen muss:
- Dev: Klassische Code-Bases. Kann auch Textdateien enthalten als Projekt-Wiki oder Projekt-Doku.
- Ops: Text-lastige Repos wie Personal-OS, Business-OS, Wikis, Markdown-RAGS.
  Kann Code enthalten, bspw. als Skript-Templates, Code-Dokumentation, Code-Snippets.
  Aber auch als operatives Main-Repo + Sub-Repo das gitignored ist. Das bringt den Vorteil dass die
  Operative ebene als privates Remote-Repo leben kann, wärend das sub-repo gitignored ist und remote öffentlich ist.
