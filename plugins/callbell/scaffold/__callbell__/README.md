# __callbell__/

Dieser Ordner ist die **von callbell verwaltete Schicht** deines Projekts. Alles, was der Agent zum Steuern des
Projekts braucht, aber nicht dein eigener Inhalt ist, liegt hier an einem Ort, getrennt von der Wurzel, wo deine
Arbeit sitzt.

## Warum es ihn gibt

Agentische Werkzeuge neigen dazu, ihren Zustand zu verstreuen: Gedächtnis an einem maschinenlokalen Ort, Notizen an
einem anderen, Regeln irgendwo anders. Verschiebe das Repo oder klone es auf einer zweiten Maschine, und dieser Zustand
ist weg oder außer Reichweite. Und in der Projektwurzel ist nie klar, welche Dateien deine sind und welche zum
Werkzeug gehören.

`__callbell__/` löst beides. Es **sammelt den Framework-Zustand in einem einzigen, selbstdokumentierenden Ordner**, der
**mit dem Repo reist** (versioniert, außer den flüchtigen Zonen unten), sodass Gedächtnis, Kontext und der
Arbeitspfad nie verloren gehen und für jeden Agenten auf jeder Maschine gleich lesen. Und es **hält deine Wurzel sauber**:
Dein Inhalt bleibt außerhalb, die Maschinerie bleibt hier drin, und ein Blick unterscheidet die beiden.

## Was drin ist

Versionierter verwalteter Zustand (trägt Frontmatter, reist mit dem Repo):
- `memory/` — dauerhafte Memories, die mit dem Repo reisen, geöffnet durch den Index `MEMORY.md`.
- `templates/` — Scaffolds, von denen der Agent kopiert, wenn er Backlog-Einträge und andere Dateien anlegt.
- `backlog/` — der operative Arbeitspfad (Aufgaben, optional in Projekte gruppiert), geöffnet durch den Index `BACKLOG.md`.

Was dieses Repo ist und wer daran arbeitet, steht in deiner eigenen `AGENTS.md` an der Wurzel, nicht hier drin — der Agent
liest sie nativ, und ein Ort dafür schlägt zwei, die sich widersprechen können.

Zonen (flüchtige I/O-Puffer, nicht versioniert, gekennzeichnet durch das Präfix `zone-`):
- `zone-import/` — eingehende Rohdaten, die du dem Agenten übergibst (CSV, PDF, Bilder, Notizen).
- `zone-export/` — ausgehende Lieferungen, die du aus dem Repo nimmst, nur auf Anfrage gefüllt.

## Damit arbeiten

Du sortierst hier drin nie etwas von Hand. Der Agent legt ab, benennt und pflegt diese Schicht nach seinen Regeln.
Wirf Rohmaterial in `zone-import/` und bitte den Agenten, es zu verarbeiten; bitte um eine Lieferung, und sie landet
in `zone-export/`. Alles Übrige legt der Agent dorthin, wo es hingehört.
