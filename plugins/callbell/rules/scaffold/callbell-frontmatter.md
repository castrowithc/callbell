---
paths: ["**/*"]
description: >
  Frontmatter standard for content Markdown files: which fields a file carries, the type enum and
  what each value means, the strict coupling of type to edit, and the principle that filed repo content
  takes precedence over the agent's training knowledge.
type: rule
edit: locked
---

# Frontmatter standard

Every content Markdown file begins with the block at the end of this file. The agent sets the
fields when creating the file and holds the invariants. Two fields carry the meaning:
- `type`: **what** the file contains.
- `edit`: **who** may change it. Follows strictly from `type`, not freely chosen.

Not every file carries frontmatter: raw zones are deliberately free of type and frontmatter (raw inputs and
outputs, the workbench). Structure, zones, backlog, and memory are set by `callbell-scaffold-rules`.

## Principle: the repo beats training knowledge

What's filed here describes **the user's reality**, not the model's. Where a file
contradicts what the agent "knows" from training data, **the file wins**. The agent follows it and
*reports* the deviation. It never overwrites the file from its own prior knowledge. This holds most strongly for
`fact` and `decision`: non-negotiable, and the only leeway is a change to the source itself.

## `type`

`meta`, `rule`, and `skill` form the **frame**: they instruct the agent. The remaining types carry
**content** within this frame, grouped into knowledge, activity, and backlog.

**Frame** (instructs the agent)

| `type` | Meaning |
|---|---|
| `meta` | Durable governance and structure: framework, index, navigation, this specification. Recognizable by the fixed function name (`framework.md`, `index.md`) or by the file sitting in `__callbell__/` (its zones and typed meta). |
| `rule` | A durable behavioral norm the agent follows by default. |
| `skill` | An actively triggered procedure. The `description` is the trigger, the body is the steps; it loads only when a matching task comes up. |

**Knowledge** (domain material)

| `type` | Meaning |
|---|---|
| `fact` | An externally bound ground truth, **non-negotiable**: a law, a tax rule, a requirement of a provider or a piece of software, which fields and options an application actually has. Checked against the primary source or the user's lived reality. It changes only when the source changes (a change in law, a software update, a new license); then `updated` is the date of the last check. |
| `knowledge` | Living, changeable domain knowledge and synthesis: an explanation, a concept, a tool overview, a standard of your own. Unlike `fact` it's open to change and extendable. The agent may maintain and improve it on its own. The lasting insights from a completed activity live here too. |
| `playbook` | A repeatable procedure or runbook, neutral and recurring (a checklist, an update strategy, onboarding steps). It describes the process itself, free of values bound to a single case or a year. |

**Activity** (concrete and dated)

| `type` | Meaning |
|---|---|
| `decision` | A binding decision **of the user's**, dated and justified. Authoritative like `fact`, but bound to the user rather than an external source. The agent **never** records a decision of its own here; it proposes, the user decides, then it's recorded. |
| `history` | A compact, running log (append-only, e.g. a changelog): what was changed, added, or removed and when. Kept only when a later evaluation really needs this chronology. |

**Backlog**

| `type` | Meaning |
|---|---|
| `task` | A work package: the unit of work, always its **own file** `task-*.md`. It carries why, scope, approach, and definition of done, so it can be worked on without follow-up questions, and it **never names another task** (order lives in the roster). Sized to one session; if the size can't be estimated, it isn't understood and must be broken down. |

The **memory system** is a standalone subsystem with a fixed location (`__callbell__/memory/`), governed
by the scaffold and opened through the index `MEMORY.md`. It isn't a filing decision and
therefore doesn't appear in this table. Memory files may carry `type: memory` (`edit: shared`),
so they can be found.

Likewise, the fixed function index `BACKLOG.md` opens the **backlog subsystem**
(`__callbell__/backlog/`). Like `MEMORY.md` it loads at session start via the hook and is a
living index, so it carries `edit: shared`, though structurally it's `meta`. That's the same deliberate
exception to the type-to-edit coupling as the memory index. A **project's `index.md`**
(`__callbell__/backlog/<project>/index.md`) is the same case one level down: a living roster,
rewritten when its tasks move, so also `meta` with `edit: shared`, plus a
`status`. The backlog's own **entries** (`task`) still follow the table above.

## `edit`: follows strictly from `type`

| `type` | `edit` | |
|---|---|---|
| `meta` · `rule` · `skill` | `locked` | Frame: instructs the agent, changes only after approval. |
| `fact` | `locked` | Authoritative, non-negotiable. |
| `knowledge` | `shared` | Living, the agent maintains it. |
| `playbook` | `locked` | A durable procedure, changes only after approval. |
| `decision` | `locked` | An authoritative user decision. |
| `history` | `shared` | Continuously appended. |
| `task` | `shared` | Active backlog. |

- **`locked`** means: precedence over training knowledge, and protected. The agent changes it **only after
  approval**, then carefully **in place**. `fact` and `decision` are the core that's non-negotiable.
- **`shared`** means: dynamic. Agent and user change the file in the normal flow of work.

`locked` does **not** mean "never touch". When a locked file must change, the agent proposes
the change **in the file itself** and waits for approval. **Duplicating** a locked file
(creating a near-copy as a new `shared` file) is **forbidden**. That's not a way around the lock.

## Invariants

1. `type` is changed after the fact only after asking; `edit` **always** follows strictly from `type`.
2. Never mix frame (`meta`/`rule`/`skill`) and content types in the same file.
3. **One `edit` per file, set by the strictest content it carries.** If a file carries authoritative
   *and* changeable material, it's `locked` as a whole. No per-section markings.
4. **Don't over-split.** A file serves one purpose, but it isn't split artificially just to serve the
   frontmatter; no unnecessary, brittle cross-references.
5. `fact` and `decision` beat training knowledge: on a contradiction the agent follows the file and
   reports it.
6. Set `source` only when the file is a snapshot of something external (a link to the living
   source).

## Date fields

`created`/`updated` only on dated, living content (`knowledge`, `history`, backlog; on `fact`,
`updated` is the date of the last check). **Never** on `meta`, `rule`, or `skill`.

## Canonical per type

Always `description`, `type`, `edit` (`edit` follows strictly from `type`, see above). Date fields only on
dated content. Everything else is the difference per type, not a superset.

**`description` is always a folded block scalar:** `description: >` on its own line, the
single-line text indented below it, never inline on the same line as the key. A colon, a
quotation mark, or an angle bracket in the text (e.g. `<project name>: what it delivers`) breaks
the YAML parsing of an inline value; the block scalar is immune to that and keeps every header uniform.

Minimal form, using `knowledge` as the example:

```
---
description: >
  What it's about, one sentence for context.
type: knowledge
edit: shared
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Difference per type (in addition to `description`/`type`/`edit`):

| Type | Additional | Deliberately not |
|---|---|---|
| `meta` | - | date fields |
| `rule` | `paths` | date fields |
| `skill` | `name` (`argument-hint`, `disable-model-invocation` optional) | date fields |
| Command (agent-native) | `argument-hint` (optional) | `type`/`edit` |
| `fact` | `source` (optional); `updated` = check date | - |
| `knowledge` · `history` | `created`, `updated` | - |
| `playbook` | - | date fields, unless it's genuinely dated |
| `decision` | `created` = date of the decision | - |
| `task` | `status`, `created`, `updated` | any key that references another task |
| `memory` | - | - |

`status` and `tags` are optional on any content type, when they earn their place.

**Exception:** official agent standards (Claude's and Codex's own skills, rules, commands, and so on)
follow their own schema; that's why a command carries no `type`/`edit`.
