# __callbell__/

This folder is the **callbell-managed layer** of your project. Everything the agent needs to steer the
project, but that is not your own content, lives here in one place, kept apart from the root where your
work sits.

## Why it exists

Agentic tools tend to scatter their state: memory in one machine-local place, notes in another, rules
somewhere else. Move the repo or clone it on a second machine and that state is gone or out of reach. And
in the project root it is never clear which files are yours and which belong to the tooling.

`__callbell__/` solves both. It **gathers the framework state in a single, self-documenting folder** that
**travels with the repo** (versioned, except the volatile zones below), so memory, context, and the work
trail are never lost and read the same for every agent on every machine. And it **keeps your root clean**:
your content stays outside, the machinery stays in here, and one glance tells the two apart.

## What is inside

Versioned managed state (carries frontmatter, travels with the repo):
- `context/` — project and user facts loaded automatically at session start (what the repo is, roles, glossary).
- `memory/` — durable memories that travel with the repo, opened by the index `MEMORY.md`.
- `templates/` — scaffolds the agent copies from when it creates backlog entries and other files.
- `backlog/` — the operational work trail (epics, stories, tasks), opened by the index `BACKLOG.md`.
- `framework.md` (ops) or `docs/framework.md` (code) — the structural registry for the project.

Zones (volatile I/O buffers, not versioned, marked by the `zone-` prefix):
- `zone-import/` — inbound raw inputs you hand to the agent (CSV, PDF, images, notes).
- `zone-export/` — outbound deliverables you take out of the repo, filled only on request.

## Working with it

You never sort anything in here by hand. The agent files, names, and maintains this layer by its rules.
Drop raw material into `zone-import/` and ask the agent to process it; ask for a deliverable and it lands
in `zone-export/`. Everything else the agent places where it belongs.
