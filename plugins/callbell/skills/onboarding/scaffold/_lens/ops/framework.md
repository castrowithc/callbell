---
description: >
  Root framework and area registry of this project: which areas exist and how the structure
  works. The root of the cascade, read when structural orientation is needed.
type: meta
edit: locked
---

# Framework

This repo is an operational workspace (Personal OS, Business OS, or both). The agent files content in a
structured way, creates and maintains it, and manages what the user sets out. The user decides and reviews
(see the Governance rule).

## Structure in brief
- Operational content lives in flat root folders `<area>-<topic>` (for example `business-finance/`).
- Alongside it the global meta level `__callbell__/` (context, memory, and the backlog `__callbell__/backlog/`, the
  operational work trail) plus the two volatile zones `__callbell__/zone-import/` (raw inputs) and
  `__callbell__/zone-export/` (requested deliverables), see `callbell-zones` and `callbell-backlog`.
- The path says WHERE something lives; the frontmatter says WHAT it is. No duplication.
- `status` drives maturity (`draft → active`), not the folder.
- Depth grows lazily: flat first, a sublevel only from the second element of the same kind.
- The details of placement come from the skill `callbell-filing` (read when filing).

## Area registry
The single source of truth for which areas and topics exist. The agent uses only what is here and invents
nothing. New entries only after approval by the user (onboarding: `/callbell-onboarding`).

<!-- Enter your areas, one per line: `<area>-<topic>`: short description. -->

<!-- EXAMPLE (delete and replace):
- `business-finance`: finances, contracts, and insurance for the business.
- `business-customers`: one subfolder per customer with their documents.
- `personal-gaming`: a personal, private topic.
-->

## Cascade
An area folder may carry its own `framework.md`, which comes into being only when it needs its own growing
work rules, and applies and is read only when work happens there. That keeps the context lean. This file,
`__callbell__/framework.md`, is the root of that cascade.
