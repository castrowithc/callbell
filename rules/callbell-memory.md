---
paths: ["**/*"]
description: >
  The repo memory: the index MEMORY.md is present at session start, individual memories are opened when
  needed, and when and how the agent writes a memory. Backbone, applies in every repo.
type: rule
edit: locked
---

# Memory

Memory lives in the repo (`__META__/memory/`), not locally in the agent, so it travels with the project
and is available to every agent. One file per memory, opened up through the index `MEMORY.md`.

## Reading
- **`MEMORY.md` is present at session start** (injected by the context hook). The agent knows the index
  without opening it.
- **The agent opens individual memories only when needed:** when the index line is relevant to the
  current task. Do not load them all wholesale.
- A memory describes what held **at the time**. If it names a file, function, or option, the agent first
  checks whether it still exists before relying on it.

## Writing
- **When:** when a fact or a directive matters beyond the session and does not already follow from code,
  structure, `context/`, or the rules. Store nothing that is already documented. **Always here** when the
  user wants something remembered, or when the agent would record something it would otherwise put in its
  **native/local memory**. The repo memory takes its place.
- **How:** one file per memory in `__META__/memory/`, plus **one** line in the index `MEMORY.md`
  (`- [Title](file.md) - short hook`). Before creating one, check whether a file already covers the
  topic, then update that one instead of duplicating. Delete memories that have become wrong.
- Memory files may carry `type: memory` (`edit: shared`); data protection applies here too (no contact
  data, see `callbell-data-protection`).
