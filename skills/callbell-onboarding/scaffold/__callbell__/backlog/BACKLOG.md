---
description: >
  Overview of the operational work trail (__callbell__/backlog/): the flat root entries and every project, each with
  status and a short description. Loaded at session start through the hook (like the memory index
  MEMORY.md), so the agent knows the open state without opening every file. Operating logic: rule
  callbell-backlog.
type: meta
edit: shared
---

# Backlog

<!-- Top overview of the work trail. Tasks with no project live flat as task-<slug>.md in
     __callbell__/backlog/; a project is a folder __callbell__/backlog/<project>/ with its own index.md.
     Location, projects, and life cycle are set by callbell-backlog; planning work is the skill
     callbell-plan.

     One line per active root task and one line per project (pointing to its index.md):
     - [Title](file-or-project/index.md) - status, short state.
     A project's own tasks are rostered in that project's index.md, not here. This roster is also where
     order and dependency live, because a task never names another task. -->
