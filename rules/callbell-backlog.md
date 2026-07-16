---
paths: ["**/*"]
description: >
  How the operational backlog is kept: the flat root as default, projects as optional folders, epics and
  stories as separate files with tasks inline in the story, status instead of moving folders, completion
  into a local done/. Backbone, applies in every repo.
type: rule
edit: locked
---

# Backlog

The backlog is the repo's operational work trail. It is versioned managed state under `__callbell__/backlog/`, not one of the volatile zones.
What the types `epic`/`story`/`task` mean is set in `callbell-frontmatter`; this rule says **where** they
live and **how** they move.

## Root default and projects
- **The `__callbell__/backlog/` root is the default.** Epics, stories, and tasks live flat here (`epic-<slug>.md`,
  `story-<slug>.md`, `task-<slug>.md`) when they belong to no explicit project. Most repos need nothing more.
- **A project is an optional folder** `__callbell__/backlog/<project>/` that gathers a body of related work (one or
  more epics, stories, or tasks) under one name, with an `index.md` header (below). The same flat entries
  live inside it: `__callbell__/backlog/<project>/epic-<slug>.md`, and so on.
- **A project is justified only on the user's request or approval** ("set up a project for X"). A project
  folder is a new structural element (see `callbell-governance`); the agent never creates one on its own.
  It **may proactively suggest** one when parallel or worktree work would otherwise collide (see
  `callbell-git`), but creates it only after approval.
- **The project slug is a plain kebab name** (`autumn-campaign/`), never an `epic-`/`story-`/`task-` prefix
  and never `done`, so folders, entries, and the completion zone stay distinguishable.
- **Membership is the folder, not the frontmatter.** An entry belongs to the project whose folder holds
  it; there is no `project:` field (the path is the single truth, see `callbell-conventions`). Root work
  that grows into its own stream moves into a new `__callbell__/backlog/<project>/` (a folder move, so after approval).

## Project header: `index.md`
Every project folder carries `__callbell__/backlog/<project>/index.md`: the project's header and roster. It states the
goal and scope and rosters the project's active epics, stories, and tasks. It carries a `description` like
every entry, so the agent can grep for it when locating where work stands.
- Frontmatter: `type: meta`, `edit: shared`, `status`. This is the same deliberate "living meta index is
  shared" exception as `MEMORY.md` and `BACKLOG.md` (see `callbell-frontmatter`).
- The root default has **no** `index.md`; `BACKLOG.md` is its overview.

## Overview: `BACKLOG.md`
`__callbell__/backlog/BACKLOG.md` is the single overview of the whole work trail, the counterpart to the memory index
`MEMORY.md`. It loads at session start through the hook, so the agent knows the open state without opening
every file. It shows the top view over **everything**: the flat root entries and every project, each with
status and a short description.
- **One line per active root entry** and **one line per project** (`- [Title](path) - status, short
  state`), the project line pointing to its `index.md`. A project's own epics, stories, and tasks are
  rostered in that project's `index.md`, not repeated here, so the overview stays lean and the cascade
  runs `BACKLOG.md` -> project `index.md` -> `epic-<slug>.md` -> `story-<slug>.md`.
- The agent **maintains it**: a new root entry or project means a new line; a status change or a
  completion updates or removes the line. It shows only active work; finished work drops out.

## File model
The three levels come from the agile Scrum framing (a proven tool, even if epic/story/task are not fixed
Scrum parts): the **epic** is the large undertaking, the **story** is one self-contained unit of value
("as a role I want a function, so that a benefit"), the **task** is the concrete operative or technical
step. Each level is its **own file**, so a single file stays small enough to read on its own. A project of
three epics and fifty stories must never be one giant file the agent has to read in full just to check off
one task.

- An **epic** is always its own file `epic-<slug>.md`. It does **not** hold stories inline: it states the
  goal and **rosters its stories** in the body as links (`- [Story: <title>](story-<slug>.md) - status`).
  It is done when its stories are done, and it may grow or be reprioritized.
- A **story** is always its own file `story-<slug>.md`. It carries the `epic:` slug when it belongs to an
  epic (empty when it stands alone) and holds its **tasks inline** as the task checklist.
- A **task** lives **inline in its story**. A standalone `task-<slug>.md` exists **only** when the task is
  genuinely independent of any epic or story (then it carries **neither** an `epic` nor a `story` field).
  This is about independence, **not** size.
- **Linkage is the `epic:` up-link on the story, plus body rosters** (the project `index.md` rosters its
  epics and any standalone stories/tasks; each epic rosters its stories). There is deliberately **no**
  down-link field, so nothing has to be kept in sync in two places (see `callbell-references`).

## Status, not moving
A backlog entry matures **in place** through `status` (`draft -> active -> final -> archived`). There is no
separate draft zone: a draft is a file with `status: draft` in its proper place, not a folder move.

## Planning: agile, not phased
Approval is needed to **create the project**, nothing more. Inside it the agent **plans and cuts** the work
into epics, stories, and tasks itself, so the backlog stays agile and bends to change instead of freezing a
phase plan up front.
- The agent gathers what it needs from the user, then lays out the breakdown. New entries start as
  `status: draft`.
- **`draft` is where assumptions die.** Agent and user shape the content in draft until it stands exactly
  as the user wants it; misreadings and agent guesses are cleared here. When the user is satisfied it
  holds, it goes `status: active`.
- **Agile changes to active work** (a new story, a re-cut task as the work evolves) the agent may make on
  its own, but it **says so** when it does. It never silently rewrites the agreed shape.

## Life cycle and completion
- A task is done: check it off in its inline block (or `status: final` in a standalone file).
- A finished entry moves into the **local** `done/`: `__callbell__/backlog/done/` for a root entry,
  `__callbell__/backlog/<project>/done/` for a project entry. Lasting insights are filed as durable content first (the
  template governs the filing); the backlog holds only the work trail.
- A project is finished when its work is done: its `index.md` goes `status: final` and its line drops out
  of the active `BACKLOG.md`; its entries rest in its local `done/`, the folder stays in place.
- Finished work no longer clutters the active view.

## Templates
Templates for new entries live in `__callbell__/templates/` (`epic.md`, `story.md`, `task.md`, and the project
header `project-index.md`); copy from there, do not reinvent.
