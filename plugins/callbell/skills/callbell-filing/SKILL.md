---
name: callbell-filing
description: >
  Decide where a file belongs and how the folder tree grows.
  Use whenever you create, place, move, promote, or restructure a content file.
  Also on "where does this go", "restructure this", "promote this",
  "callbell-filing", or "/callbell-filing".
type: skill
edit: locked
---

# Filing: where a file belongs and how the tree grows

Place content in the project outside `__callbell__/`. That layer is filed by its own rule (`callbell-scaffold-rules`), never by hand; nothing here applies to it.

## The path is the structural truth

- No `domain/area/topic` hierarchy. The area folder is the top level; depth grows only inside it, and only where needed.
- Area and topic live in the folder name, never in frontmatter.
- The type shows in the path too: as a prefix `<type>-<name>.md` while filing stays flat, or as a folder `<type>/` once grouped. Where path and frontmatter disagree, frontmatter wins. Raw zones carry no type at all.

Area folders are an **ops** structure, and so is their register. In an ops repo, `__callbell__/index.md` lists which areas and topics exist; use only what's there, and don't create a new area without approval. That file doesn't ship with the scaffold: it appears with the first area, and until then there are no areas to register. A **code** repo has no area register and needs none: the root is the code project, and docs live under `__callbell__/docs/`. Check the lens before reaching for the register.

## Look for a template first

Before reinventing a recurring area structure (customers, projects, objects), check `__callbell__/templates/` for a fitting template and instantiate it. The customer pattern ships with every scaffold; in a **code** repo you rarely reach for it, but it's there. Where it fits, it works like this: the area `business-customers/` gets a `framework.md` (how to identify, how to search, which data never flows in) and a subfolder `<id>/index.md` per customer. Only if no template fits do you build your own and propose recording the pattern as a template.

## Area folder first

Operational content lives in a flat root folder `<area>-<topic>` (e.g. `business-finance/`). Pick the right area folder first (from the register), then place the file in it. If nothing fits cleanly or an area overflows: don't guess, propose an adjustment and wait for approval.

## Default placement and the >5 threshold

- **Default: flat with a type prefix**, so `<area>-<topic>/<type>-<name>.md` (e.g. `business-finance/fact-<name>.md`).
- **A type folder once more than 5 files of the same type sit in one folder:** move them into `<type>/` (now the folder is the type; the prefix drops).
- **Subtopics** are the owner's call, not the file count. The >5 threshold only makes a type folder, never a new topic. `fact` and `knowledge` may grow large without being split.

## Type → placement

| `type` | Placement |
|---|---|
| `fact` · `knowledge` · `history` | Flat with prefix `<area>-<topic>/<type>-<name>.md`; once more than 5 of the same type, a `<type>/` folder. |
| `playbook` | Next to the recurring process it serves (`<area>-<topic>/[<subtopic>/]playbooks/`); otherwise flat `playbook-<name>.md`. |
| `decision` | Central and dated in the area: `<area>-<topic>/decisions/YYYY-MM-DD-….md`. Structural and meta decisions concern the framework, not an area. |
| `meta` | Flat, no prefix: `<area>-<topic>/framework.md` (root of the cascade: ops `__callbell__/framework.md`, code `__callbell__/docs/framework.md`, each created when first needed). |
| `task` | In `__callbell__/backlog/`, the versioned work trail. Location and lifecycle are not a filing decision. |
| `memory` | In `__callbell__/memory/`, reached through its index. Also not a filing decision. |

Never place rules and skills by hand. They ship with the plugin and load into the session; a copy in the repo is a defect, not a placement.

**Precedence** (decide in this order): a central `decision`, then `meta`/framework (flat), then `playbook` (process), then the rest, flat with prefix.

## References (content model)

- **Content never points to meta.** Content types (`fact`/`knowledge`/`playbook`/`history`) don't cite a meta or framing file (`AGENTS.md`, `framework.md`, rules, skills). Dependencies run only from meta to content (downward), never back. So a governance rebuild breaks no content file, and content stays self-contained.
- `[[…]]` to other content files is fine.
- The one exception: a `decision` whose subject is the structure itself.

## Zones

The two `__callbell__/` zones are managed centrally. Relevant to filing:

- **`<area>-<topic>/work/`**: the area's workbench: raw, headless work in progress, internal substructure allowed (e.g. `work/2025/`). It keeps the area level readable: `<area>-<topic>/` should show only type folders (and flat type files). Send anything that would otherwise spawn foreign folders (years, ad-hoc groups) into `work/` rather than hiding the type folders.
- **`__callbell__/zone-import/`** (root): raw external inputs, transient, gitignored.
- **`__callbell__/zone-export/`** (root): requested human deliverables, only on explicit request, no types, no frontmatter. Not part of the knowledge base; the agent files nothing here on its own.

## Draft and maturity through status

There is no separate draft zone. A draft is a file with `status: draft` at its proper place, maturing there in place. "Promotion" is a status change (`draft → active`), not a move; it needs approval.

- **`fact`/`knowledge`** are created directly in the right `<area>-<topic>/`, first `status: draft`, then `status: active`.
- **`decision`**: `status: draft` while it's weighed; on approval `status: active`, date = approval date (not draft date), dated in `decisions/…`.
- **Standing rules** of an area move into its `framework.md`.
- **Backlog**: maturity and closure follow the backlog's own lifecycle, not this skill.

## Lazy depth: two separate thresholds

Folders appear with their first file, never empty on spec. Two different things, two thresholds:

- **A sublevel (subtopic): at the 2nd file of the same kind.** A single file stays flat; the second creates the named sublevel. An area may go straight to types (`<area>-<topic>/knowledge/`) as long as there's only one field.
- **A type folder: at more than 5 files of the same type** (see above).

**Migration invariant:** before the second subtopic, first lift the flat material into the first named sublevel, then add the new one beside it. Example: `business-finance/knowledge/` plus a new subtopic becomes first `business-finance/<subtopic-1>/knowledge/`, then `business-finance/<subtopic-2>/`.

## Cascade

One `framework.md` per area or subtopic, lazy and as an overlay: it appears only when the folder needs its own growing work rules (beyond what the backbone of `AGENTS.md`, rules, and skills already covers), and it describes how work is done there (search, identification, local guardrails). Read it only when work happens there. No nested `AGENTS.md`/`CLAUDE.md` down in the depth: the cascade runs solely through the `framework.md` files by path (read from the root), not through harness auto-loading.

## Placement limits

- **No asset store.** This is a planning layer, not storage for bulk, media, or *changing* binaries. Allowed: one small, stable image when it *is* the artifact (e.g. a diagram). Large files go to a file store or Git LFS; transient inputs go to `__callbell__/zone-import/`.
- **Rare but important becomes a playbook.** A procedure needed only a few times a year lives as its own playbook and is referenced elsewhere with a one-line pointer, keeping required reading lean.
- **A playbook is neutral and recurring.** It describes the repeatable procedure (for tools: fields, options, forms, what goes where), free of case- or year-specific numbers; concrete values go to the right `fact` or the `work/` zone.
