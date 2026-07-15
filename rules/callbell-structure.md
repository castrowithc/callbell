---
paths: ["**/*"]
description: >
  Where files belong: flat, self-explaining area folders in the root, the type is visible in the path,
  the path is the structural truth, status drives maturity, folders grow only when needed. New areas
  only after approval.
type: rule
edit: locked
---

# Structure: the Placement Invariants

These rules always apply. The full procedure (placement, thresholds, promotion) lives in the skill
`callbell-filing` and is read only when you actually file or move a file.

**The root is your workspace; `__callbell__/` is callbell's layer.** The **operational level** is the flat
area folders `<area>-<topic>` (for example `business-finance/`, `personal-gaming/`) in the repo root, where
your content lives. The **callbell-managed layer** is the single folder `__callbell__/`: the meta level
(context, memory, templates, docs) plus the zones `__callbell__/_import/`, `__callbell__/_export/`, and
`__callbell__/_backlog/` (see `callbell-zones`). Area-local meta (`framework.md`), by contrast, lives **in**
the operational level, with the area it sharpens. No deep `domain/area/topic` hierarchy: the area folder is
the top level, depth arises inside it and only when needed.

**Content folders are named `<area>-<topic>`.** The area up front groups related topics and makes the
folder self-explaining for human and agent (`business-finance`, `personal-gaming`). Which areas and
topics exist is set by the registry (below), not by the agent's gut.

**The type is visible in the path.** Every file shows its `type` without being opened: as a file name
prefix (`<type>-<name>.md`) while flat, or as a `<type>/` folder once grouped. Never hide the type.

**The area level stays readable.** Inside a `<area>-<topic>/` there are only flat type files and type
folders. That way a human sees after one click which types exist and that content is there. Anything that
is not a type group (years, ad hoc bundles) belongs in the area's `work/` folder, never out in the open
beside it; otherwise the type folders drown and the pattern is misread. The area-local `work/` is a raw
zone (no type, no frontmatter), like the root zones.

**The path is the structural truth.** Area and topic sit in the folder name, not in the frontmatter. One
place decides the structure: the path.

**Areas come from the registry, not from the gut.** Which areas and topics exist is stated in the
registry in `__callbell__/framework.md`. The agent uses only what is there and invents no areas. A new area, a
new topic, or a loosening of the schema requires approval (see `callbell-governance`).

**Status drives maturity, not location.** Unfinished material carries `status: draft` and lives in its
proper place; it matures there in place until `status: active`. There is no separate draft zone: draft
and active state differ by `status`, not by folder. Backlog maturity is set by `callbell-backlog`.

**Folders grow only when needed.** A folder comes into being with its first file, never empty just in
case. A named sublevel appears only once a second element of the same kind is added. An area gets its own
`framework.md` only when it needs growing, distinct work rules (not already covered by the backbone).
