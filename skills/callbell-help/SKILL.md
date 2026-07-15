---
name: callbell-help
description: >
  Quick reference for callbell in this repo: the lazy levels, which skills exist, and how agent and user
  work together. One-shot display, not a persistent mode. Trigger: /callbell-help, "callbell help",
  "what can callbell do", "what callbell commands", "how do I work here".
type: skill
edit: locked
---

# Callbell Help

Display this card when invoked. One-shot, no mode change, persist nothing. Show the domain-unique skill for
the current lens (`PROJECT TYPE`): **callbell-gain** for code, **callbell-filing** for ops.

## Levels

| Level | Trigger | What changes |
|-------|---------|--------------|
| **muffin** | `/callbell muffin` | Build what is asked, name the lazier alternative in one line. |
| **cake** | `/callbell` | The ladder enforced: YAGNI → reuse → platform/flat → one line → minimum. Default. |
| **buffet** | `/callbell buffet` | YAGNI extremist. Deletion before addition, challenge the requirement. |

The level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **callbell** | `/callbell` | Lazy mode itself: the simplest, leanest thing that works, in code or structure. |
| **callbell-review** | `/callbell-review` | Review a change for over-engineering or over-structuring. One line per finding. |
| **callbell-audit** | `/callbell-audit` | Tree-wide audit: ranked list of what to cut, merge, or flatten. |
| **callbell-debt** | `/callbell-debt` | Harvests every `callbell:` marker into a debt ledger. |
| **callbell-gain** *(code)* | `/callbell-gain` | Measured-impact scoreboard: less code, less cost, more speed. |
| **callbell-filing** *(ops)* | `/callbell-filing` | Decides where a file belongs and how the tree grows. |
| **callbell-import** | "it's in the inbox", `/callbell-import` | Turns raw material in `_import/` into redacted, filed content. |
| **callbell-onboarding** | `/callbell-onboarding` | One-time repo setup: purpose, scaffolds, and how you work together. |
| **callbell-worktree** | `/callbell-worktree` | Git worktree for parallel work, cleaned up after the merge. |
| **callbell-help** | `/callbell-help` | This card. |

Codex uses the same skills with the `@` prefix (`@callbell`, `@callbell-review`, and so on); Claude uses the
`/` forms above.

## How you work together

- **Roles:** you decide and review, the agent executes in a structured and largely autonomous way.
- **Approvals:** structure or schema changes (and new areas in ops) and promotion of drafts only after
  approval; routine within the established scope the agent handles itself (see `callbell-governance`).
- **Structure:** the path says WHERE, the frontmatter says WHAT, `status` drives maturity.
- **Zones:** `_import/` (inputs), `_export/` (requested deliverables), `_backlog/` (work trail).

## Namespace

`callbell-*` is reserved for the skills the template ships. Put your own skills outside this prefix so
template and user skills stay distinguishable. Deactivate: "stop callbell" or "normal mode".
