---
name: callbell-audit
description: >
  Whole-repo or workspace-wide audit for over-engineering or over-structuring. Like callbell-review, but
  scans the entire tree instead of one change: a ranked list of what to delete, simplify, merge, or flatten.
  Use on "audit this codebase", "audit this repo", "audit the filing", "what can I delete", "find bloat",
  "find sprawl", "what can I clean up", or /callbell-audit. One-shot report, applies nothing.
type: skill
edit: locked
---

# Callbell Audit

callbell-review, tree-wide. Scan the whole repo (code) or workspace (ops) instead of one change. Same tags
and format as callbell-review; read the lens once from `PROJECT TYPE`. Rank the findings, biggest cut first.

## The hunt

- code: deps the stdlib or platform already ships, single-implementation interfaces, factories with one
  product, wrappers that only delegate, files exporting one thing, dead flags and config, hand-rolled stdlib.
- ops: areas with no content, folders with one file, a `framework.md` with no delta from the backbone,
  duplicate topics across areas, docs that retell a rule, deep trees where a flat level is enough,
  `status: draft` that never went active and nobody needs.

## Output

One line per finding, ranked: `<tag> <what to cut>. <replacement>. [loc]`. Close with
`net: -<N> lines, -<M> deps possible.` (code) or `net: -<N> files, -<M> folders possible.` (ops).
Nothing to cut: `Lean already. Ship.`

Example (ops):

```
delete: 3 empty area folders with no content. Nothing. [personal-todo/, business-ideas/, business-old/]
merge:  business-finances/ and business-finance/ are the same. Into business-finance/.
flatten: business-finance/2024/invoices/ (3 files). Flat with a fact prefix.
net: -5 files, -4 folders possible.
```

## Boundaries

Scope: over-engineering and redundancy only. Correctness, security, performance, data protection, and
guardrails are out of scope, route them to a normal review. Lists findings, changes nothing. One-shot.
"stop callbell-audit" or "normal mode": revert.
