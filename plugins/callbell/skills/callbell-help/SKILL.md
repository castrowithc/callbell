---
name: callbell-help
description: >
  Quick reference to callbell in this repo: which skills the core ships, what other packs exist, and how
  agent and user work together. Shown once, not a persistent mode. Triggers: /callbell-help, "callbell help",
  "what can callbell do", "which callbell commands", "how do I work here".
type: skill
edit: locked
disable-model-invocation: true
---

<!-- Show the user the following card to quide them -->

# Callbell Help

Show this card when called. Once, no mode change, nothing saved.

The core is the interface between you and the agent: shared norms, a scaffold for backlog and memory, filing, import, planning, and git. It carries no purpose of its own; the packs decide what gets worked on.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **start** | `/callbell-start` | The way in: checks dependencies and scaffold, adds what's missing, settles purpose and roles once. Call it when you arrive or when something's missing. |
| **filing** | `/callbell-filing` | Decides where a file belongs and how the tree grows. |
| **plan** | `/callbell-plan` only | Turns an idea into work packages: why, scope, approach, done. You start it; it never starts itself. |
| **import** | "it's in the inbox", `/callbell-import` | Turns raw material in `__callbell__/zone-import/` into redacted, filed content. |
| **commit** | `/callbell-commit`, "commit this" | Commits through a message you've read: drafted, shown in full, corrected, then committed and pushed. |
| **worktree** | `/callbell-worktree` | A git worktree for parallel work, cleaned up after the merge. |
| **adhd** | `/callbell-adhd` | Shapes output for an ADHD reader: next action first, numbered steps, state restated each turn. Stays on until "stop adhd mode". |
| **help** | `/callbell-help` | This card. |

Codex calls the same skills with the `@` prefix; Claude uses the `/` forms above.

## Packs

The core doesn't decide *which* work gets done; the packs do. Switch them on individually in the same marketplace; none is preselected:

| Pack | For |
|------|-----|
| **callbell-dev** | Code: the laziest solution that actually holds, in three levels, plus a review against over-engineering, for a diff or the whole repo. `/callbell-dev-help` |
| **callbell-sysadmin** | Servers: a quiet safety layer plus skills for operations. `/callbell-sysadmin-help` |

## How you work together

- **Roles:** you decide and review; the agent executes, structured and largely on its own.
- **Approvals:** structure or schema changes (and new areas in ops), plus promoting drafts, only after approval; routine within the established frame the agent handles itself.
- **Structure:** the path says WHERE, the frontmatter says WHAT, `status` drives maturity.
- **Zones:** `__callbell__/zone-import/` (inputs) and `__callbell__/zone-export/` (requested deliverables), the two transient buffers. The versioned work trail is `__callbell__/backlog/` (managed state, not a zone).

## Namespace

The core's skills carry the `callbell-` prefix in their name, so you find them all at once by typing `/callbell`. You put your own skills outside the packs; they can't collide.
