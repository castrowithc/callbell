---
name: callbell-help
description: >
  Kurzreferenz zu callbell in diesem Repo: die Faulheitsstufen, welche Skills es gibt und wie Agent und
  Nutzer zusammenarbeiten. Einmalige Anzeige, kein dauerhafter Modus. Auslöser: /callbell-help,
  "callbell help", "callbell hilfe", "was kann callbell", "welche callbell befehle", "wie arbeite ich hier".
type: skill
edit: locked
---

# Callbell Hilfe

Zeige diese Karte, wenn du aufgerufen wirst. Einmalig, kein Moduswechsel, nichts wird gespeichert. Zeige
den fachlich einzigartigen Skill für die aktuelle Sicht (`PROJECT TYPE`): **callbell-gain** für code,
**callbell-filing** für ops.

## Stufen

| Stufe | Auslöser | Was sich ändert |
|-------|----------|-----------------|
| **muffin** | `/callbell muffin` | Bau, was verlangt ist, und nenne die faulere Alternative in einer Zeile. |
| **cake** | `/callbell cake` (oder bloßes `/callbell`) | Die Leiter durchgesetzt: YAGNI → Wiederverwenden → Plattform/flach → eine Zeile → Minimum. Standard. |
| **buffet** | `/callbell buffet` | YAGNI-Extremist. Löschen vor Hinzufügen, die Anforderung selbst infrage stellen. |

Die Stufe bleibt, bis sie geändert wird oder die Session endet.

## Skills

| Skill | Auslöser | Was er tut |
|-------|----------|------------|
| **callbell** | `/callbell` | Der faule Modus selbst: das Einfachste und Schlankeste, das funktioniert, in Code oder Struktur. |
| **callbell-review** | `/callbell-review` | Prüft eine Änderung auf Overengineering oder Überstrukturierung. Eine Zeile pro Fund. |
| **callbell-audit** | `/callbell-audit` | Prüfung über den ganzen Baum: geordnete Liste, was zu streichen, zusammenzuführen oder zu verflachen ist. |
| **callbell-debt** | `/callbell-debt` | Sammelt jede `callbell:`-Markierung in ein Schuldenverzeichnis. |
| **callbell-gain** *(code)* | `/callbell-gain` | Anzeigetafel der gemessenen Wirkung: weniger Code, weniger Kosten, mehr Tempo. |
| **callbell-filing** *(ops)* | `/callbell-filing` | Entscheidet, wohin eine Datei gehört und wie der Baum wächst. |
| **callbell-plan** | nur `/callbell-plan` | Macht aus einer Idee Arbeitspakete: Warum, Rahmen, Vorgehen, fertig. Du startest ihn; er startet sich nie selbst. |
| **callbell-import** | "liegt in der Ablage", `/callbell-import` | Macht aus Rohmaterial in `__callbell__/zone-import/` geschwärzten, abgelegten Inhalt. |
| **start** | `/callbell:start` | Der Einstieg: prüft Abhängigkeiten und Gerüst, ergänzt was fehlt, klärt einmalig Zweck und Rollen. Läuft jedes Mal. |
| **callbell-commit** | `/callbell-commit`, "committe das" | Committet über eine Nachricht, die du gelesen hast: entworfen, vollständig gezeigt, korrigiert, dann committet und gepusht. |
| **callbell-worktree** | `/callbell-worktree` | Git-Worktree für parallele Arbeit, nach dem Merge aufgeräumt. |
| **callbell-help** | `/callbell-help` | Diese Karte. |

Jeder Skill ist überall installiert; die Sicht schaltet sie nicht frei oder ab. Die Marken `(code)` und
`(ops)` sagen, für welche Art Repo ein Skill gedacht ist, nicht ob du ihn hast.

Codex nutzt dieselben Skills mit dem Präfix `@` (`@callbell`, `@callbell-review` und so weiter); Claude
nutzt die `/`-Formen oben.

## Wie ihr zusammenarbeitet

- **Rollen:** du entscheidest und prüfst, der Agent führt strukturiert und weitgehend eigenständig aus.
- **Freigaben:** Struktur- oder Schemaänderungen (und neue Bereiche in ops) sowie das Überführen von
  Entwürfen nur nach Freigabe; Routine im etablierten Rahmen erledigt der Agent selbst (siehe
  `callbell-governance`).
- **Struktur:** der Pfad sagt WO, das Frontmatter sagt WAS, `status` treibt die Reife.
- **Zonen:** `__callbell__/zone-import/` (Eingaben) und `__callbell__/zone-export/` (angeforderte
  Ergebnisse), die zwei flüchtigen Puffer. Die versionierte Arbeitsspur ist `__callbell__/backlog/`
  (verwalteter Zustand, keine Zone).

## Namensraum

`callbell-*` ist für die Skills reserviert, die die Vorlage mitliefert. Lege eigene Skills außerhalb dieses
Präfixes an, damit Vorlagen- und Nutzer-Skills unterscheidbar bleiben. Abschalten: "stop callbell" oder
"normaler Modus".
