---
description: >
  Framework for the docs of this code project: what lives in __META__/docs/ and how it is organized.
  Applies at the __META__ level, the root of the docs cascade.
type: meta
edit: locked
---

# Docs Framework

This directory (`__META__/docs/`) holds the project's documentation: repo and user docs, occasionally
personal learnings or summaries. It applies at the `__META__` level; the root stays the code project.

## Structure
- Docs are organized by topic in folders `<area>-<topic>` as they grow; single files stay flat.
- The path says WHERE something lives; the frontmatter says WHAT it is.
- Depth grows lazily: flat first, a sublevel only from the second element of the same kind.
- A folder may carry its own `framework.md`, which comes into being only when it needs its own growing
  work rules, and applies and is read only when work happens there (cascade, keeps the context lean).

## Collaboration
The same rules apply as across the whole repo: the user decides and reviews, the agent executes in a
structured and largely autonomous way; structure changes only after approval (see the Governance rule).
