---
paths: ["**/*"]
description: >
  Where the operational work trail lives and how it moves: tasks flat in the backlog root, projects as
  optional folders, status instead of folder moves, every task self-contained. Backbone, applies in every
  repo. The procedure for planning and cutting work is the skill callbell-plan.
type: rule
edit: locked
---

# Backlog

The backlog is the repo's operational work trail: versioned managed state under `__callbell__/backlog/`,
not one of the volatile zones. This rule holds the standing invariants.

**Planning and cutting work is the skill `callbell-plan`, and only the user starts it** (`/callbell-plan`).
Never start planning on your own: wanting a thing built and thinking a thing through look identical from
the outside, and only the user knows which one is happening. Guessing wrong is expensive, because a
half-formed idea gets cut into packages before it was ready. When work comes up that looks like it wants
planning, **say so and offer the skill**, then let the user decide. Suggesting costs nothing; starting
costs their idea.

## Where work lives
- **A task is the unit of work, and its own file** `task-<slug>.md`. It lives flat in
  `__callbell__/backlog/` when it belongs to no project. Most repos need nothing more.
- **A project is an optional folder** `__callbell__/backlog/<project>/` holding its tasks plus an
  `index.md` header (`type: meta`, `edit: shared`, `status`) that states goal and scope and rosters the
  work. It is created **only on the user's request or approval** (a new structural element, see
  `callbell-governance`). Its slug is a plain kebab name, never a `task-` prefix and never `done`.
- **Membership is the folder, not the frontmatter.** The path is the single truth; there is no `project:`
  field.

## Every task is self-contained
**A task never names another task.** It carries everything needed to work on it, and nothing that points
sideways. This is enforceable because a file name in a task body *is* an instruction to read it: no norm
overrides that, so the name must not be written in the first place.

Order and dependency live in the roster (`BACKLOG.md`, or a project's `index.md`), never in a task. A task
that follows another does not read it: what it needs is the predecessor's **result**, and that lives in the
repo. Work whose parts genuinely depend on each other belongs in a project folder, where the `index.md`
carries the sequence.

## Status is the truth
A task matures **in place** through `status` (`draft -> active -> final -> archived`). There is no draft
zone: a draft is a file with `status: draft` in its proper place.

Completion is **one atomic step, never half of it**: a finished task gets `status: final` **and** moves
into the local `done/` in the same act (`__callbell__/backlog/done/`, or `<project>/done/`). So a task is
never `active` inside `done/`, nor `final` in the active tree. On a disagreement between `status:` and a
roster line, `status:` wins and the roster is corrected. A project is finished when its `index.md` goes
`final`; the folder stays.

## Overview: `BACKLOG.md`
`__callbell__/backlog/BACKLOG.md` is the single overview, the counterpart to `MEMORY.md`, loaded at session
start through the hook so the open state is present without opening every file. **One line per active root
task and one line per project** (`- [Title](path) - status, short state`), the project line pointing to its
`index.md`. The agent maintains it; finished work drops out.

## Templates
Scaffolds live in `__callbell__/templates/`. Copy from there, do not reinvent. A scaffold is **renamed as
it is copied**, because it never carries a reserved name itself (see `callbell-conventions`):

| Scaffold | Becomes |
|---|---|
| `task.md` | `__callbell__/backlog/task-<slug>.md`, or `<project>/task-<slug>.md` |
| `project-index.md` | `__callbell__/backlog/<project>/index.md` |
