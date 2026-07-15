---
name: callbell-filing
description: >
  Decide where a file belongs and how the folder tree grows. Use this whenever
  you create, place, move, promote, or restructure a content file: which area
  folder, flat-with-prefix vs. a type folder, which zone (work / import / export),
  and how a draft becomes active through its status. Also use on "where does this
  go", "restructure this", "promote this", "callbell-filing", or
  "/callbell-filing".
type: skill
edit: locked
---

# Filing: where a file belongs and how the tree grows

Placement follows the invariants in the rule `callbell-structure`. This skill is the procedure behind
them. Which areas and topics exist is stated in the registry in `__callbell__/framework.md`; the agent uses
only what is there and creates no new area without approval (see `callbell-governance`).

## Look for a template first

Before you reinvent a recurring area structure (for example customers, projects, objects), check
`__callbell__/templates/` for a matching template and instantiate it. For customers there is a pattern there:
the area `business-customers/` gets a `framework.md` (how to identify, how to search, which data never
flows in) and one subfolder `<id>/index.md` per customer. Only when no template fits do you build your own
and propose to the user that the pattern be captured as a template.

## The area folder first

Operational content lives in a flat root folder `<area>-<topic>` (for example `business-finance/`). First
pick the right area folder (from the registry), then place the file inside it. If nothing fits cleanly or
an area overflows: do not guess, propose an adjustment and wait for approval.

## Default placement and the >5 threshold

- **Default: flat with a type prefix**, that is `<area>-<topic>/<type>-<name>.md` (for example
  `business-finance/fact-<name>.md`).
- **A type folder once more than 5 files of the same type** are in one folder → move them into `<type>/`
  (now the folder is the type; the prefix drops away).
- **Subtopics** are decided by the owner, not by the file count. The >5 threshold creates only a type
  folder, never a new topic. `fact` and `knowledge` may grow large without being split.

## Type → placement

| `type` | Placement |
|---|---|
| `fact` · `knowledge` · `history` | Flat with a prefix `<area>-<topic>/<type>-<name>.md`; once more than 5 of the same type → a `<type>/` folder. |
| `playbook` | Next to the recurring process it serves (`<area>-<topic>/[<subtopic>/]playbooks/`); otherwise flat `playbook-<name>.md`. |
| `decision` | Central and dated in the area: `<area>-<topic>/decisions/YYYY-MM-DD-….md`. Structural and meta decisions concern the framework, not one area. |
| `meta` | Flat, no prefix: `<area>-<topic>/framework.md` (the root registry = `__callbell__/framework.md`). |
| `epic` · `story` · `task` | In the `__callbell__/_backlog/` zone. Location and life cycle are set by `callbell-backlog`. |
| `memory` | `__callbell__/memory/*.md` (see `callbell-memory`). |

Rules and skills are not placed by hand: they live natively in `.claude/rules/` and `.claude/skills/`
(Codex mirror: `.agents/skills/`).

**Precedence** (decide in this order): a central `decision` → `meta`/framework (flat) → `playbook`
(process) → the rest, flat with a prefix.

## References (content model)

- **Content never points to meta.** Content types (`fact`/`knowledge`/`playbook`/`history`) cite no meta
  or framing file (`AGENTS.md`, `framework.md`, rules, skills). Dependencies run only from meta to content
  (downward), never back. That way a governance rework breaks no content file, and content stays
  self-contained.
- `[[…]]` to other content files is allowed.
- The only exception: a `decision` whose subject is the structure itself.

## Zones

The zones are central (see `callbell-zones`). Relevant for filing:

- **`<area>-<topic>/work/`**: the area's workbench: raw, header-less work in progress, internal
  substructure allowed (for example `work/2025/`). It keeps the area level **readable**: `<area>-<topic>/`
  should show only type folders (and flat type files). Anything that would otherwise create foreign folders
  (years, ad hoc groups) moves into `work/` instead of hiding the type folders.
- **`__callbell__/_import/`** (root): raw external inputs, volatile, gitignored.
- **`__callbell__/_export/`** (root): requested human deliverables, **only on explicit request**, without types,
  without frontmatter. Not part of the knowledge base; the agent files nothing here on its own.

## Draft and maturity through status

There is **no separate draft zone**. A draft is a file with `status: draft` in its proper place, and it
matures there in place. "Promotion" is a **change of status** (`draft → active`), not a move; it requires
approval (see `callbell-governance`).

- **`fact`/`knowledge`** are created directly in the right `<area>-<topic>/`, first `status: draft`, then
  `status: active`.
- **`decision`**: `status: draft` while it is being weighed; on approval `status: active`, date = release
  date (not draft date), dated in `decisions/…`.
- **Standing rules** of an area move into its `framework.md`.
- **Backlog**: maturity and completion are set by `callbell-backlog` (`__callbell__/_backlog/` → `__callbell__/_backlog/done/`).

## Lazy depth: two separate thresholds

Folders appear with their first file, never empty just in case. **Two different things, two thresholds:**

- **A sublevel (subtopic): from the 2nd file of the same kind.** A single file stays flat; the second
  creates the named sublevel. An area may go straight to types (`<area>-<topic>/knowledge/`) as long as
  there is only one field.
- **A type folder: from more than 5 files of the same type** (see above).

**Migration invariant:** before the second subtopic, first lift the flat material into the first named
sublevel, then add the new one beside it. Example: `business-finance/knowledge/` plus a new subtopic →
first `business-finance/<subtopic-1>/knowledge/`, then `business-finance/<subtopic-2>/`.

## Cascade

One `framework.md` per area or subtopic, **lazy and as an overlay**: it comes into being only when the
folder needs its own growing work rules (what the backbone from `__callbell__/context`, rules, and skills does
not already cover), and it describes how work is done there (search, identification, local guardrails). It
is read only when work happens there. No nested `AGENTS.md`/`CLAUDE.md` down in the depth: the cascade runs
solely through the `framework.md` files by path (read from the root), not through harness auto-loading.

## Placement boundaries

- **No asset store.** This is a planning layer, not a store for bulk, media, or *changing* binary files.
  Allowed: a small, stable image when it *is* the artifact (for example a diagram). Large files → a file
  store or Git LFS; volatile inputs → `__callbell__/_import/`.
- **Rare but important → a playbook.** A procedure needed only a few times a year lives as its own playbook
  and is referenced elsewhere with a one-line pointer, so the required reading stays lean.
- **A playbook is neutral and recurring.** It describes the repeatable procedure (for tools: fields,
  options, forms, what goes where), free of case or year specific numbers; concrete values → the right
  `fact` or the `work/` zone.
