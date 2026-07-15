---
paths: ["**/*"]
description: >
  Naming and format conventions: kebab-case/ASCII, ISO date, the type prefix on flatly filed artifacts, fixed-function file names.
type: rule
edit: locked
---

# Naming and Format: Conventions

- **All names:** kebab-case, plain ASCII, no umlauts, no spaces (Müller becomes `mueller`). Applies to
  **all** folder and file names.
- **Date format:** ISO `YYYY-MM-DD`. Chronological files may start with the date
  (`YYYY-MM-DD-topic.md`) and sort in order that way.
- **Type prefix:** flatly filed artifacts carry their `type` as a file prefix (`fact-…`,
  `knowledge-…`, `playbook-…`, `history-…`). The prefix follows the `type` in the frontmatter; on a
  drift the frontmatter is canonical. Raw zones carry no type (see `callbell-zones`).

Domain-specific IDs (for example case or customer numbers) are local to their topic, not global.

## Fixed-Function File Names

Files with a fixed role are recognized by their **name** (not by a type prefix). They no longer carry a
`_` prefix; the agent finds them by name, and the human sorts nothing.

| Name | Role |
|---|---|
| `framework.md` | framework for a level (`type: meta`) |
| `README.md` | structural header of a folder or area (no enum `type`) |
| `index.md` | index or roster of a folder or entity |
| `MEMORY.md` | index of the agent's memory |
| `BACKLOG.md` | index of the operational work trail (`_backlog/`) |
| `history.md` | running log of a folder (`type: history`) |

These names are **exclusive in the working tree**: a real fixed-function file is named exactly
`framework.md` or `index.md`, never prefixed. That keeps the cascade fast and unambiguous: a `framework.md`
or `index.md` at any level of the tree is always a real node, read it. A **scaffold** for one of these
files lives only in `__META__/templates/` and is named with its target as a suffix
(`project-index.md`, for example), never the bare reserved name. The suffix says what the
scaffold becomes and keeps it out of the node scan, because its name is not exactly `framework.md` or
`index.md`.
