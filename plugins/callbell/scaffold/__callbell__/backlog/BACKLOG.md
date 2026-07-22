---
description: >
  Overview of the operational work trail (__callbell__/backlog/): the flat root entries and each project, each with
  status and a short description. Loaded at session start via the hook (like the memory index
  MEMORY.md), so the agent knows the open state without opening every file. Operational logic: the
  scaffold norm.
type: meta
edit: shared
---

# Backlog

<!-- Top overview of the work trail. Tasks with no project live flat as task-<slug>.md in
     __callbell__/backlog/; a project is a folder __callbell__/backlog/<project>/ with its own index.md.
     Location, projects, and lifecycle are set by the scaffold norm; the planning work is the skill
     callbell-plan.

     One line per active root task and one line per project (pointing to its index.md):
     - [Title](file-or-project/index.md) - status, short state.
     A project's own tasks are rostered in its index.md, not here. This roster is also where
     order and dependency live, because a task never names another task. -->
