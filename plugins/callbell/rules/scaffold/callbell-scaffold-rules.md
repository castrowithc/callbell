---
paths: ["**/*"]
description: >
  The callbell-managed layer __callbell__/: the fixed function file names, the two I/O zones,
  the backlog, and the memory.
license: MIT
type: rule
edit: locked
---

# Scaffold rules: the `__callbell__/` layer

Applies where a `__callbell__/` scaffold exists, and only to that folder. Where content belongs in the
rest of the project and how the tree grows there is the job of the skill `callbell-filing`.

The scaffold is project-type-neutral. It sits in a code base just as in a text-heavy repo and
brings both the same structure: the same subsystems, the same names, the same invariants. What the
folder contains and what it's for is in `__callbell__/README.md`. The rules are here; the
procedures for them live in the skills and are read only when you run them.

For the layer as a whole:

- The agent maintains it by these rules. The user rarely sorts in it by hand.
- It's versioned and travels with the repo, so context, memory, and the work trail read the same on every
  machine. The user defines the exception, then the folder sits locally gitignored.
- The two zones should be gitignored, as they're transient zones that always exist.
- It carries frame, not domain content. A file here is `meta`, unless a subsystem below
  explicitly provides otherwise.

---

## Fixed function file names

| Name | Role |
|---|---|
| `framework.md` | frame for a level (`type: meta`) outside `__callbell__` |
| `README.md` | structural head of a folder or area (no enum `type`) |
| `index.md` | index or roster of a folder or an entity |
| `MEMORY.md` | index of the agent's memory |
| `BACKLOG.md` | index of the operational work trail |
| `history.md` | running log of a folder (`type: history`) |

These names are exclusive and apply across the whole repo, not just here: a function file is named exactly that,
never with a prefix. A `framework.md` or `index.md` anywhere in the tree is therefore always a real node
and gets read.

Templates for them live in `__callbell__/templates/` and carry their target as a suffix (`project-index.md`),
so they don't enter the node scan. They're renamed on copy, because they may never carry a
reserved name themselves. Before reinventing a recurring structure, look there.

---

## Zones

Two transient I/O buffers, recognizable by the `zone-` prefix: raw material comes in here and a result goes
out. They exist in every repo (kept via `.gitkeep`). They're never
versioned.

- `zone-import/` is inbound, from the user to the agent: CSV, PDF, images, notes, exports.
  The agent converts to Markdown and files the result in its proper place; the original moves
  to `zone-import/processed/<yyyy-mm>/`.
- `zone-export/` is outbound, from the agent to the user: reports, extracts, exports, only on explicit
  request. The agent files nothing here on its own. A result often carries the real, unredacted
  data the user wants to take away; that's why this zone is gitignored too.

No zone may grow without bound. Archiving an original is routine, emptying a container is
a deletion. Large or changing binaries belong in a file store or Git LFS, not
permanently in a zone, if the repo has a remote and is pushed (limits).

---

## Backlog

The operational work trail under `__callbell__/backlog/`: versioned state.

Where work lives:

- A task is the unit of work and its own file `task-<slug>.md`, flat in `__callbell__/backlog/`.
  Most repos need no more.
- A project is an optional folder `__callbell__/backlog/<project>/` with its tasks and a head
  `index.md` (`type: meta`, `edit: shared`, `status`) carrying goal, scope, and order. Its slug is
  a plain kebab name, never with a `task-` prefix and never `done`.
- Membership is the folder. There's no `project:` field.

A task never names another task. It carries everything needed to work on it, because a filename in
its body would be the instruction to read that file. Order and dependency live in the
roster (`BACKLOG.md` or the project's `index.md`). What a following task needs is the
predecessor's result, and that's in the repo. Work with real dependencies belongs in a
project folder.

Status is the truth (`draft -> active -> final -> archived`). Closing is a single
step: `status: final` and, in the same move, into `done/` (`__callbell__/backlog/done/` or
`<project>/done/`). So a task is never `active` in `done/` and never `final` in the active tree. If
`status:` and the roster disagree, `status:` wins. A project is done when its `index.md` goes to
`final`; the folder stays. Not every project ends: a product line stays `active` and rests
empty between rounds.

`BACKLOG.md` is the one overview. One line per active root task and one per project (`- [title](path) - status, short
state`), the project line points at its `index.md`. The agent maintains it, finished work drops out.

---

## Memory

Memory lives in the repo (`__callbell__/memory/`) persistently, not locally in the agent, so it travels with the
project. One file per memory, opened through the index `MEMORY.md`. Without a `__callbell__/` scaffold the
agent uses its native memory.

Reading:

- `MEMORY.md` is present at session start. The agent knows the index without opening it.
- It opens individual memories only when the index line is relevant to the task. Don't load them all
  wholesale.
- A memory describes what held at the time. If it names a file, a function, or an option, the agent
  first checks whether it still exists.

Writing:

- When: when something counts beyond the session and doesn't already follow from code, structure, the `AGENTS.md`,
  or the rules. Always here when the user wants something remembered or the agent would otherwise put it in its
  native memory. The repo memory takes its place.
- How: a file in `__callbell__/memory/`, plus a line in the index (`- [title](file.md) - short
  hook`). If a file already covers the topic, update it rather than duplicate. Delete what has become
  wrong.
- Memory files may carry `type: memory` (`edit: shared`); data protection applies here too, so
  no contact data.
