# __callbell__/

This folder is the **callbell-managed layer** of your project. Everything the agent needs to steer the project, but that isn't your own content, sits here in one place, separate from the root where your work lives.

## Why it exists

Agentic tools tend to scatter their state: memory in a machine-local place, notes in another, rules somewhere else. Move the repo or clone it on a second machine, and that state is gone or out of reach. And in the project root it's never clear which files are yours and which belong to the tool.

`__callbell__/` solves both. It **collects the framework state in a single, self-documenting folder** that **travels with the repo** (versioned, except the transient zones below), so memory, context, and the work trail never get lost and read the same for every agent on every machine. And it **keeps your root clean**: your content stays outside, the machinery stays in here, and one glance tells the two apart.

## What's in it

Versioned managed state (carries frontmatter, travels with the repo):
- `memory/`: durable memories that travel with the repo, opened through the index `MEMORY.md`.
- `templates/`: scaffolds the agent copies from when creating backlog entries and other files.
- `backlog/`: the operational work trail (tasks, optionally grouped into projects), opened through the index `BACKLOG.md`.

What this repo is and who works on it lives in your own `AGENTS.md` at the root, not in here: the agent reads it natively, and one place for it beats two that can contradict each other.

Zones (transient I/O buffers, not versioned, marked by the `zone-` prefix):
- `zone-import/`: incoming raw data you hand the agent (CSV, PDF, images, notes).
- `zone-export/`: outgoing deliverables you take out of the repo, filled only on request.

## Working with it

You never sort anything in here by hand. The agent files, names, and maintains this layer by its rules. Drop raw material in `zone-import/` and ask the agent to process it; ask for a deliverable, and it lands in `zone-export/`. Everything else the agent files where it belongs.
