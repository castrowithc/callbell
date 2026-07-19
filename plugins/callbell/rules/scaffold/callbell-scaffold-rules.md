---
paths: ["**/*"]
description: >
  Die von callbell verwaltete Schicht __callbell__/: die festen Funktionsdateinamen, die zwei I/O-Zonen,
  das Backlog und das Gedächtnis.
type: rule
edit: locked
---

# Grundgerüst Regeln: die Schicht `__callbell__/`

Gilt, wo ein `__callbell__/`-Gerüst existiert, und ausschließlich für diesen Ordner. Wohin Inhalt im
übrigen Projekt gehört und wie der Baum dort wächst, ist Sache des Skills `callbell-filing`.

Das Gerüst ist projekttypneutral. Es liegt in einer Code-Base genauso wie in einem Textlastigen Repo und
bringt beiden dieselbe Struktur mit: dieselben Teilsysteme, dieselben Namen, dieselben Invarianten. Was der
Ordner enthält und wozu er da ist, steht in `__callbell__/README.md`. Hier stehen die Regeln; die
Prozeduren dazu liegen in den Skills und werden nur gelesen, wenn du sie ausführst.

Für die Schicht als Ganzes gilt:

- Der Agent pflegt sie nach diesen Regeln. Der Nutzer sortiert selten darin von Hand.
- Sie ist versioniert und wandert mit dem Repo, damit Kontext, Gedächtnis und Arbeitsspur auf jeder
  Maschine gleich gelesen werden. Ausnahme definiert der Nutzer - dann liegt der ordner lokal gitignored.
- Die beiden Zonen sollen gitignored sein, da das temporäre Zonen sind die aber immer existieren.
- Sie trägt Rahmen, keinen Fachinhalt. Eine Datei hier ist `meta`, soweit nicht ein Teilsystem unten
  ausdrücklich etwas anderes vorsieht.

---

## Feste Funktionsdateinamen

| Name | Rolle |
|---|---|
| `framework.md` | Rahmen für eine Ebene (`type: meta`) außerhalb von `__callbell__` |
| `README.md` | struktureller Kopf eines Ordners oder Bereichs (kein Enum-`type`) |
| `index.md` | Index oder Aufstellung eines Ordners oder einer Entität |
| `MEMORY.md` | Index des Agenten-Gedächtnisses |
| `BACKLOG.md` | Index der operativen Arbeitsspur |
| `history.md` | laufendes Protokoll eines Ordners (`type: history`) |

Diese Namen sind exklusiv und gelten im ganzen Repo, nicht nur hier: eine Funktionsdatei heißt genau so,
nie mit Präfix. Eine `framework.md` oder `index.md` irgendwo im Baum ist deshalb immer ein echter Knoten
und wird gelesen.

Gerüste dafür leben in `__callbell__/templates/` und tragen ihr Ziel als Suffix (`project-index.md`), damit
sie nicht in den Knotenscan geraten. Beim Kopieren werden sie umbenannt, weil sie nie selbst einen
reservierten Namen tragen dürfen. Bevor du eine wiederkehrende Struktur neu erfindest, sieh dort nach.

---

## Zonen

Zwei flüchtige I/O-Puffer, erkennbar am Präfix `zone-`: hier kommt Rohmaterial herein und geht ein Ergebnis
hinaus. Sie existieren in jedem Repo (gehalten über `.gitkeep`). Sie werden nie
versioniert.

- `zone-import/` ist eingehend, vom Nutzer an den Agenten: CSV, PDF, Bilder, Notizen, Exporte.
  Der Agent wandelt nach Markdown und legt das Ergebnis an seinem richtigen Platz ab; das Original wandert
  nach `zone-import/processed/<yyyy-mm>/`.
- `zone-export/` ist ausgehend, vom Agenten an den Nutzer: Berichte, Auszüge, Exporte, nur auf ausdrückliche
  Anfrage. Der Agent legt hier nichts von sich aus ab. Ein Ergebnis trägt oft die echten, ungeschwärzten
  Daten, die der Nutzer mitnehmen will; deshalb ist auch diese Zone gitignoriert.

Keine Zone darf unbegrenzt wachsen. Ein Original zu archivieren ist Routine, einen Behälter zu leeren ist
eine Löschung. Große oder sich ändernde Binärdateien gehören in einen Dateispeicher oder in Git LFS, nicht
dauerhaft in eine Zone, sofern das Repo Remote und gepusht wird (Limits).

---

## Backlog

Die operative Arbeitsspur unter `__callbell__/backlog/`: versionierter Zustand.

Wo Arbeit liegt:

- Ein Task ist die Arbeitseinheit und eine eigene Datei `task-<slug>.md`, flach in `__callbell__/backlog/`.
  Die meisten Repos brauchen nicht mehr.
- Ein Projekt ist ein optionaler Ordner `__callbell__/backlog/<projekt>/` mit seinen Tasks und einem Kopf
  `index.md` (`type: meta`, `edit: shared`, `status`), der Ziel, Rahmen und Reihenfolge trägt. Sein Slug ist
  ein schlichter kebab-Name, nie mit `task-`-Präfix und nie `done`.
- Die Zugehörigkeit ist der Ordner. Es gibt kein Feld `project:`.

Ein Task nennt nie einen anderen Task. Er trägt alles, was zum Bearbeiten nötig ist, denn ein Dateiname in
seinem Rumpf wäre die Anweisung, diese Datei zu lesen. Reihenfolge und Abhängigkeit leben in der
Aufstellung (`BACKLOG.md` oder die `index.md` des Projekts). Was ein folgender Task braucht, ist das
Ergebnis des Vorgängers, und das liegt im Repo. Arbeit mit echten Abhängigkeiten gehört in einen
Projektordner.

Der Status ist die Wahrheit (`draft -> active -> final -> archived`). Der Abschluss ist ein einziger
Schritt: `status: final` und im selben Zug nach `done/` (`__callbell__/backlog/done/` oder
`<projekt>/done/`). So ist ein Task nie `active` in `done/` und nie `final` im aktiven Baum. Widersprechen
sich `status:` und die Aufstellung, gewinnt `status:`. Ein Projekt ist fertig, wenn seine `index.md` auf
`final` geht; der Ordner bleibt. Nicht jedes Projekt endet: eine Produktlinie bleibt `active` und ruht
zwischen den Runden leer.

`BACKLOG.md` ist der eine Überblick. Eine Zeile pro aktivem Wurzel-Task und eine pro Projekt (`- [Titel](pfad) - status, kurzer
Stand`), die Projektzeile zeigt auf dessen `index.md`. Der Agent pflegt sie, fertige Arbeit fällt heraus.

---

## Gedächtnis

Das Gedächtnis liegt im Repo (`__callbell__/memory/`) persistent, nicht lokal im Agenten, damit es mit dem Projekt
mitwandert. Eine Datei pro Erinnerung, erschlossen über den Index `MEMORY.md`. Ohne `__callbell__/`-Gerüst
nutzt der Agent sein natives Gedächtnis.

Lesen:

- `MEMORY.md` liegt beim Session-Start vor. Der Agent kennt den Index, ohne ihn zu öffnen.
- Einzelne Erinnerungen öffnet er nur, wenn die Indexzeile für die Aufgabe relevant ist. Nicht pauschal
  alle laden.
- Eine Erinnerung beschreibt, was damals galt. Nennt sie eine Datei, eine Funktion oder eine Option, prüft
  der Agent erst, ob es das noch gibt.

Schreiben:

- Wann: wenn etwas über die Session hinaus zählt und sich nicht schon aus Code, Struktur, `context/` oder
  den Regeln ergibt. Immer hier, wenn der Nutzer sich etwas gemerkt wünscht oder der Agent es sonst in sein
  natives Gedächtnis legen würde. Das Repo-Gedächtnis tritt an dessen Stelle.
- Wie: eine Datei in `__callbell__/memory/`, dazu eine Zeile im Index (`- [Titel](datei.md) - kurzer
  Aufhänger`). Deckt eine Datei das Thema schon ab, aktualisiere sie, statt zu doppeln. Lösche, was falsch
  geworden ist.
- Gedächtnisdateien dürfen `type: memory` tragen (`edit: shared`); der Datenschutz gilt auch hier, also
  keine Kontaktdaten.
