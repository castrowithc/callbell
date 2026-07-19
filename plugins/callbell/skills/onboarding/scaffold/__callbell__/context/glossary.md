---
description: >
  A glossary defined by the user for consistent communication between user and
  agent. What counts is how the user understands a word, not the agent. The agent
  spots possible misunderstandings and actively offers to add the term here. Loaded
  automatically into context at session start.
type: meta
edit: locked
---

# Glossary

Consistent wording between user and agent. What counts is how the user understands a word. The agent adds
new terms after approval.

## Example
- **<word, words, or phrase>**: the definition the user has set down here.

## Base vocabulary
Shipped by default, extensible by the user:

- **rules**: global behavior norms the agent follows by default in the project; usually kept in the
  agent's native folders (`.claude/`, `.codex/`, `.agents/`, and so on).
- **context**: project and user specific facts the agent needs to know for the work (for example this
  file); everything in the `context` folder is loaded automatically into context at session start.
- **skills**, **commands**, **hooks**: extensions that give the agent extra abilities, callable commands,
  and automatic procedures; usually kept in the agent's native folders (`.claude/`, `.codex/`, `.agents/`,
  and so on).
