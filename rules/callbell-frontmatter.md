---
paths: ["**/*"]
description: >
  Frontmatter standard for content Markdown files: which fields a file carries, the type enum and
  what each value means, the fixed type to edit coupling, and the principle that stored repo content
  takes precedence over the agent's training knowledge.
type: rule
edit: locked
---

# Frontmatter Standard

Every content Markdown file begins with the block shown at the end of this file. The agent sets the
fields when it creates the file and holds the invariants. Two fields carry the meaning:
- `type`: **what** the file contains.
- `edit`: **who** may change it. Follows strictly from `type`, not free to choose.

Not every file carries frontmatter: raw zones are deliberately free of type and frontmatter (raw inputs
and outputs, the workbench). Which zones exist and what they are called is set by `callbell-zones`.

## Core principle: the repo beats training knowledge

What is stored here describes **the user's reality**, not the model's. Where a file contradicts what the
agent "knows" from training data, **the file wins**. The agent follows it and *reports* the discrepancy.
It never overwrites the file from its own prior knowledge. This holds most strongly for `fact` and
`decision`: not negotiable, and the only room to move is a change to the source itself.

## `type`

`meta`, `rule`, and `skill` form the **framing**: they instruct the agent. The remaining types carry
**content** within that framing, grouped into knowledge, activity, and backlog.

**Framing** (instructs the agent)

| `type` | Meaning |
|---|---|
| `meta` | Standing governance and structure: frameworks, index, navigation, this spec. Recognizable by its fixed-function name (`framework.md`, `index.md`, see `callbell-conventions`) or by the file living in `__callbell__/` (its zones and typed meta). |
| `rule` | A standing behavior norm that the agent follows by default. |
| `skill` | An actively triggered procedure. The `description` is the trigger, the body is the steps; it loads only when a matching task appears. |

**Knowledge** (subject matter)

| `type` | Meaning |
|---|---|
| `fact` | An externally bound ground truth, **not negotiable**: a law, a tax rule, a provider or software requirement, which fields and options an application actually has. Verified against the primary source or the user's lived reality. It changes only when the source changes (a change in law, a software update, a new license); then `updated` is the date of the last verification. |
| `knowledge` | Living, editable subject knowledge and synthesis: an explanation, a concept, a tool overview, your own standard. Unlike `fact`, it is open to change and can be extended. The agent may maintain and improve it on its own. The lasting takeaways from a finished activity live here too. |
| `playbook` | A repeatable procedure or runbook, neutral and recurring (a checklist, an update strategy, onboarding steps). It describes the process itself, free of values tied to one case or one year. |

**Activity** (concrete and dated)

| `type` | Meaning |
|---|---|
| `decision` | A binding decision made **by the user**, dated and reasoned. Authoritative like `fact`, but bound to the user rather than to an external source. The agent **never** records a decision of its own here; it proposes, the user decides, then it is recorded. |
| `history` | A compact, running log (append only, for example a changelog): what was changed, added, or removed and when. Kept only when a later analysis genuinely needs this chronology. |

**Backlog** (agile framework)

| `type` | Meaning |
|---|---|
| `epic` | A large undertaking, broken into stories. Its **own file** `epic-*.md`; it rosters its stories in the body and does not hold them inline. Done when its stories are done (see `callbell-backlog`). |
| `story` | A self-contained unit of value ("as a role I want a function, so that a benefit"). Its **own file** `story-*.md`; carries the `epic:` key when it belongs to an epic, and holds its **tasks inline**. |
| `task` | A single operative or technical step, **inline** in its `story-*.md`. A standalone `task-*.md` exists only when the task is genuinely independent of any epic or story (then it carries neither field), not by size. |

The **memory system** is a standalone subsystem with a fixed location (`__callbell__/memory/`), governed by
`callbell-memory` and opened up through the index `MEMORY.md`. It is not a filing decision, so it does not
appear in this table. Memory files may carry `type: memory` (`edit: shared`) for discoverability.

In the same way, the fixed-function index `BACKLOG.md` opens up the **backlog subsystem** (`__callbell__/backlog/`,
governed by `callbell-backlog`). Like `MEMORY.md` it loads at session start through the hook and is a
living index, so it carries `edit: shared` even though structurally it is `meta`. This is the same
deliberate exception to the type to edit coupling as with the memory index. The backlog **entries**
themselves (`epic`/`story`/`task`) still follow the table above.

## `edit`: follows strictly from `type`

| `type` | `edit` | |
|---|---|---|
| `meta` · `rule` · `skill` | `locked` | Framing: instructs the agent, change only after approval. |
| `fact` | `locked` | Authoritative, not negotiable. |
| `knowledge` | `shared` | Living, the agent helps maintain it. |
| `playbook` | `locked` | A standing procedure, change only after approval. |
| `decision` | `locked` | An authoritative user decision. |
| `history` | `shared` | Kept up over time. |
| `epic` · `story` · `task` | `shared` | Active backlog. |

- **`locked`** means: precedence over training knowledge, and protected. The agent changes it **only
  after approval**, then carefully **in place**. `fact` and `decision` are the core that is not negotiable.
- **`shared`** means: dynamic. Agent and user change the file in the normal flow of work.

`locked` does **not** mean "never touch it". When a locked file needs to change, the agent proposes the
edit **in the file itself** and waits for approval. **Duplicating** a locked file (creating a near copy as
a new `shared` file) is **forbidden**. That is not a way around the lock.

## Invariants

1. `type` is changed after the fact only after checking back; `edit` **always** follows strictly from `type`.
2. Never mix framing (`meta`/`rule`/`skill`) and content types in the same file.
3. **One `edit` per file, set by the strictest content it holds.** If a file carries authoritative *and*
   editable material, it is `locked` as a whole. No per-section markers.
4. **Do not over-split.** A file serves one purpose, but it is not carved up artificially just to satisfy
   the frontmatter; no needless, breakable cross-references (see `callbell-references`).
5. `fact` and `decision` beat training knowledge: on a contradiction the agent follows the file and reports it.
6. Set `source` only when the file is a snapshot of something external (a link to the living source).

## Date fields

`created`/`updated` only on dated, living content (`knowledge`, `history`, backlog; for `fact`, `updated`
is the date of the last verification). **Never** on `meta`, `rule`, or `skill`.

## Canonical per type

Always `description`, `type`, `edit` (`edit` follows strictly from `type`, see above). Date fields only on
dated content. Everything else is the delta per type, not a superset.

**`description` is always a folded block scalar:** `description: >` on its own line, the one-line text
indented beneath it, never inline on the same line as the key. A colon, quote, or angle bracket in the text
(for example `<project name>: what it delivers`) breaks an inline value's YAML parse; the block scalar is
immune and keeps every header uniform.

Minimal form, using `knowledge` as the example:

```
---
description: >
  What it is about, one sentence for triage.
type: knowledge
edit: shared
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Delta per type (in addition to `description`/`type`/`edit`):

| Type | Also | Deliberately not |
|---|---|---|
| `meta` | - | date fields |
| `rule` | `paths` | date fields |
| `skill` | `name` (`argument-hint`, `disable-model-invocation` optional) | date fields |
| Command (agent native) | `argument-hint` (optional) | `type`/`edit` |
| `fact` | `source` (optional); `updated` = verification date | epic/story |
| `knowledge` · `history` | `created`, `updated` | epic/story |
| `playbook` | - | epic/story; date only when dated |
| `decision` | `created` = release date | epic/story |
| `epic` · `story` · `task` | `status`, `created`, `updated`; story only: `epic` | a `task:` key |
| `memory` | - | - |

`status` and `tags` are optional on any content type, when they earn their place.

**Exception:** official agent standards (Claude's and Codex's own skills, rules, commands, and so on)
follow their own schema; that is why a command carries no `type`/`edit`.
