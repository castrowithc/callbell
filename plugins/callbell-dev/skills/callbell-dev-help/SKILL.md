---
name: callbell-dev-help
description: >
  Quick reference to the callbell-dev pack: its levels, its skills, and how to call them. Shown once, not a
  persistent mode. Triggers: /callbell-dev-help, "callbell-dev help", "which dev commands", "how do I use the
  dev pack".
disable-model-invocation: true
type: skill
edit: locked
---

<!-- Show the user the following card to quide them -->

# callbell-dev

The code pack: a lazy senior developer and the skills that review their work. Show this card when called. Once only, change no level, write no flag files, persist nothing.

## Levels

| Level | Call | What changes |
|-------|------|--------------|
| **lite** | `/callbell-dev lite` | Build what's asked, name the lazier alternative in one line. |
| **full** | `/callbell-dev` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **ultra** | `/callbell-dev ultra` | YAGNI extremist. Delete before adding. Question the requirement before building it. |

Once set, the level stays active for the whole session, reaffirmed each turn, until you switch or stop it.

## Skills

| Skill | Call | What it does |
|-------|------|-------------|
| **dev** | `/callbell-dev` | Lazy mode itself: the simplest solution that works. |
| **review** | `/callbell-dev-review` | Over-engineering review of a diff: `L42: yagni: Factory, one product. Inline.` Append `repo` for a pass over the whole tree, sorted by largest cut first. |
| **help** | `/callbell-dev-help` | This card. |

## Stop

Say "normal mode" or "stop dev". Resume anytime by calling the skill again.

## Requires

The callbell core. This pack decides *how* code gets built; the core carries the norms, the filing, and the scaffold it's built in.
