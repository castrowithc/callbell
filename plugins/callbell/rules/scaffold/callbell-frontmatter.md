---
paths: ["**/*"]
description: >
  Frontmatter-Standard für inhaltliche Markdown-Dateien: welche Felder eine Datei trägt, das type-Enum und
  was jeder Wert bedeutet, die feste Kopplung von type an edit, und der Grundsatz, dass abgelegter
  Repo-Inhalt Vorrang vor dem Trainingswissen des Agenten hat.
type: rule
edit: locked
---

# Frontmatter-Standard

Jede inhaltliche Markdown-Datei beginnt mit dem Block, der am Ende dieser Datei steht. Der Agent setzt die
Felder beim Anlegen der Datei und hält die Invarianten. Zwei Felder tragen die Bedeutung:
- `type`: **was** die Datei enthält.
- `edit`: **wer** sie ändern darf. Folgt strikt aus `type`, nicht frei wählbar.

Nicht jede Datei trägt Frontmatter: Rohzonen sind bewusst frei von Typ und Frontmatter (Roheingaben und
-ausgaben, die Werkbank). Struktur, Zonen, Backlog und Gedächtnis legt `callbell-scaffold-rules` fest.

## Grundsatz: der Repo schlägt das Trainingswissen

Was hier abgelegt ist, beschreibt **die Wirklichkeit des Nutzers**, nicht die des Modells. Wo eine Datei
dem widerspricht, was der Agent aus Trainingsdaten "weiß", **gewinnt die Datei**. Der Agent folgt ihr und
*meldet* die Abweichung. Er überschreibt die Datei nie aus eigenem Vorwissen. Am stärksten gilt das für
`fact` und `decision`: nicht verhandelbar, und der einzige Spielraum ist eine Änderung der Quelle selbst.

## `type`

`meta`, `rule` und `skill` bilden den **Rahmen**: sie weisen den Agenten an. Die übrigen Typen tragen
**Inhalt** innerhalb dieses Rahmens, gruppiert in Wissen, Aktivität und Backlog.

**Rahmen** (weist den Agenten an)

| `type` | Bedeutung |
|---|---|
| `meta` | Dauerhafte Governance und Struktur: Rahmen, Index, Navigation, diese Spezifikation. Erkennbar am festen Funktionsnamen (`framework.md`, `index.md`) oder daran, dass die Datei in `__callbell__/` liegt (dessen Zonen und typisiertes Meta). |
| `rule` | Eine dauerhafte Verhaltensnorm, der der Agent standardmäßig folgt. |
| `skill` | Eine aktiv ausgelöste Prozedur. Die `description` ist der Auslöser, der Rumpf sind die Schritte; sie lädt nur, wenn eine passende Aufgabe auftaucht. |

**Wissen** (Fachliches)

| `type` | Bedeutung |
|---|---|
| `fact` | Eine extern gebundene Grundwahrheit, **nicht verhandelbar**: ein Gesetz, eine Steuerregel, eine Anforderung eines Anbieters oder einer Software, welche Felder und Optionen eine Anwendung tatsächlich hat. Geprüft an der Primärquelle oder an der gelebten Wirklichkeit des Nutzers. Sie ändert sich nur, wenn sich die Quelle ändert (eine Gesetzesänderung, ein Software-Update, eine neue Lizenz); dann ist `updated` das Datum der letzten Prüfung. |
| `knowledge` | Lebendes, änderbares Fachwissen und Synthese: eine Erklärung, ein Konzept, eine Werkzeugübersicht, ein eigener Standard. Anders als `fact` ist es offen für Änderung und erweiterbar. Der Agent darf es eigenständig pflegen und verbessern. Auch die bleibenden Erkenntnisse aus einer abgeschlossenen Aktivität leben hier. |
| `playbook` | Eine wiederholbare Prozedur oder ein Runbook, neutral und wiederkehrend (eine Checkliste, eine Update-Strategie, Onboarding-Schritte). Es beschreibt den Ablauf selbst, frei von Werten, die an einen Einzelfall oder ein Jahr gebunden sind. |

**Aktivität** (konkret und datiert)

| `type` | Bedeutung |
|---|---|
| `decision` | Eine bindende Entscheidung **des Nutzers**, datiert und begründet. Maßgeblich wie `fact`, aber an den Nutzer gebunden statt an eine externe Quelle. Der Agent hält hier **nie** eine eigene Entscheidung fest; er schlägt vor, der Nutzer entscheidet, danach wird es festgehalten. |
| `history` | Ein kompaktes, laufendes Protokoll (nur anhängend, zum Beispiel ein Changelog): was wann geändert, ergänzt oder entfernt wurde. Nur geführt, wenn eine spätere Auswertung diese Chronologie wirklich braucht. |

**Backlog**

| `type` | Bedeutung |
|---|---|
| `task` | Ein Arbeitspaket: die Arbeitseinheit, immer eine **eigene Datei** `task-*.md`. Sie trägt Warum, Rahmen, Vorgehen und Definition of Done, damit ohne Rückfragen daran gearbeitet werden kann, und sie **nennt nie einen anderen Task** (die Reihenfolge lebt in der Aufstellung). Zugeschnitten auf eine Session; lässt sich die Größe nicht schätzen, ist sie nicht verstanden und muss zerlegt werden. |

Das **Gedächtnissystem** ist ein eigenständiges Teilsystem mit festem Ort (`__callbell__/memory/`), geregelt
vom Grundgerüst und erschlossen über den Index `MEMORY.md`. Es ist keine Ablageentscheidung und
erscheint deshalb nicht in dieser Tabelle. Gedächtnisdateien dürfen `type: memory` (`edit: shared`) tragen,
damit man sie findet.

Genauso erschließt der feste Funktionsindex `BACKLOG.md` das **Backlog-Teilsystem**
(`__callbell__/backlog/`). Wie `MEMORY.md` lädt er beim Session-Start über den Hook und ist ein
lebender Index, trägt also `edit: shared`, obwohl er strukturell `meta` ist. Das ist dieselbe bewusste
Ausnahme von der Kopplung type zu edit wie beim Gedächtnisindex. Die **`index.md` eines Projekts**
(`__callbell__/backlog/<projekt>/index.md`) ist derselbe Fall eine Ebene tiefer: eine lebende Aufstellung,
die neu geschrieben wird, wenn sich ihre Tasks bewegen, also ebenfalls `meta` mit `edit: shared`, dazu ein
`status`. Die **Einträge** des Backlogs selbst (`task`) folgen weiterhin der Tabelle oben.

## `edit`: folgt strikt aus `type`

| `type` | `edit` | |
|---|---|---|
| `meta` · `rule` · `skill` | `locked` | Rahmen: weist den Agenten an, Änderung nur nach Freigabe. |
| `fact` | `locked` | Maßgeblich, nicht verhandelbar. |
| `knowledge` | `shared` | Lebend, der Agent pflegt mit. |
| `playbook` | `locked` | Eine dauerhafte Prozedur, Änderung nur nach Freigabe. |
| `decision` | `locked` | Eine maßgebliche Nutzerentscheidung. |
| `history` | `shared` | Wird laufend fortgeschrieben. |
| `task` | `shared` | Aktives Backlog. |

- **`locked`** heißt: Vorrang vor dem Trainingswissen, und geschützt. Der Agent ändert es **nur nach
  Freigabe**, dann sorgfältig **an Ort und Stelle**. `fact` und `decision` sind der Kern, der nicht
  verhandelbar ist.
- **`shared`** heißt: dynamisch. Agent und Nutzer ändern die Datei im normalen Arbeitsfluss.

`locked` heißt **nicht** "nie anfassen". Wenn eine gesperrte Datei geändert werden muss, schlägt der Agent
die Änderung **in der Datei selbst** vor und wartet auf Freigabe. Eine gesperrte Datei zu **duplizieren**
(eine Beinahe-Kopie als neue `shared`-Datei anzulegen) ist **verboten**. Das ist kein Weg an der Sperre
vorbei.

## Invarianten

1. `type` wird nachträglich nur nach Rückfrage geändert; `edit` folgt **immer** strikt aus `type`.
2. Rahmen (`meta`/`rule`/`skill`) und Inhaltstypen nie in derselben Datei mischen.
3. **Ein `edit` pro Datei, gesetzt vom striktesten Inhalt, den sie trägt.** Trägt eine Datei maßgebliches
   *und* änderbares Material, ist sie als Ganzes `locked`. Keine Markierungen pro Abschnitt.
4. **Nicht überteilen.** Eine Datei dient einem Zweck, aber sie wird nicht künstlich zerlegt, nur um das
   Frontmatter zu bedienen; keine unnötigen, brüchigen Querverweise.
5. `fact` und `decision` schlagen das Trainingswissen: bei einem Widerspruch folgt der Agent der Datei und
   meldet es.
6. Setze `source` nur, wenn die Datei die Momentaufnahme von etwas Externem ist (ein Link auf die lebende
   Quelle).

## Datumsfelder

`created`/`updated` nur bei datiertem, lebendem Inhalt (`knowledge`, `history`, Backlog; bei `fact` ist
`updated` das Datum der letzten Prüfung). **Nie** bei `meta`, `rule` oder `skill`.

## Kanonisch pro Typ

Immer `description`, `type`, `edit` (`edit` folgt strikt aus `type`, siehe oben). Datumsfelder nur bei
datiertem Inhalt. Alles Weitere ist der Unterschied pro Typ, keine Obermenge.

**`description` ist immer ein gefalteter Block-Skalar:** `description: >` in einer eigenen Zeile, der
einzeilige Text darunter eingerückt, nie inline in derselben Zeile wie der Schlüssel. Ein Doppelpunkt, ein
Anführungszeichen oder eine spitze Klammer im Text (zum Beispiel `<Projektname>: was es liefert`) zerlegt
das YAML-Parsing eines Inline-Werts; der Block-Skalar ist dagegen immun und hält jeden Kopf einheitlich.

Minimalform, am Beispiel `knowledge`:

```
---
description: >
  Worum es geht, ein Satz zur Einordnung.
type: knowledge
edit: shared
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Unterschied pro Typ (zusätzlich zu `description`/`type`/`edit`):

| Typ | Zusätzlich | Bewusst nicht |
|---|---|---|
| `meta` | - | Datumsfelder |
| `rule` | `paths` | Datumsfelder |
| `skill` | `name` (`argument-hint`, `disable-model-invocation` optional) | Datumsfelder |
| Command (agent-nativ) | `argument-hint` (optional) | `type`/`edit` |
| `fact` | `source` (optional); `updated` = Prüfdatum | - |
| `knowledge` · `history` | `created`, `updated` | - |
| `playbook` | - | Datumsfelder, außer es ist wirklich datiert |
| `decision` | `created` = Datum der Festlegung | - |
| `task` | `status`, `created`, `updated` | jeder Schlüssel, der auf einen anderen Task verweist |
| `memory` | - | - |

`status` und `tags` sind bei jedem Inhaltstyp optional, wenn sie sich ihren Platz verdienen.

**Ausnahme:** offizielle Agent-Standards (Claudes und Codex' eigene Skills, Regeln, Commands und so weiter)
folgen ihrem eigenen Schema; deshalb trägt ein Command kein `type`/`edit`.
