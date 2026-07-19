---
name: help
description: >
  Quick-reference card for the callbell-dev pack: its levels, its skills, and
  how to call them. One-shot display, not a persistent mode. Trigger:
  /callbell-dev:help, "callbell-dev help", "what dev commands", "how do I use
  the dev pack".
type: skill
edit: locked
---

# callbell-dev

The code pack: one lazy senior developer and the four skills that check its
work. Display this card when invoked. One-shot — do NOT change any level,
write flag files, or persist anything.

## Levels

| Level | Call | What changes |
|-------|------|--------------|
| **lite** | `/callbell-dev:dev lite` | Build what's asked, name the lazier alternative in one line. |
| **full** | `/callbell-dev:dev` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **ultra** | `/callbell-dev:dev ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

The level holds for the work it was called for, not for the whole session.
Call it again when you want it back.

## Skills

| Skill | Call | What it does |
|-------|------|--------------|
| **dev** | `/callbell-dev:dev` | Lazy mode itself. The simplest solution that works. |
| **review** | `/callbell-dev:review` | Over-engineering review of a diff: `L42: yagni: factory, one product. Inline.` |
| **audit** | `/callbell-dev:audit` | The same, repo-wide: a ranked list of what to delete. |
| **debt** | `/callbell-dev:debt` | Harvest `callbell:` shortcut comments into a tracked ledger. |
| **gain** | `/callbell-dev:gain` | Measured-impact scoreboard: less code, less cost, more speed. |
| **help** | `/callbell-dev:help` | This card. |

## Stop

Say "stop" or "normal mode". Resume any time by calling the skill again.

## Requires

The callbell core. This pack decides *how* code gets built; the core carries
the norms, the filing, and the scaffold it gets built in.
