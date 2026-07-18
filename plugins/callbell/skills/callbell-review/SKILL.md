---
name: callbell-review
description: >
  Review a change strictly for over-engineering and redundancy, never correctness. In code: reinvented
  stdlib, needless dependencies, speculative abstractions, dead flexibility. In structure and docs:
  duplicate docs, dead folders, needless depth, text that only repeats a rule or the framework. One line per
  finding: location, what to cut, what replaces it. Use on "review for over-engineering", "what can we
  delete", "is this over-engineered", "is this over-structured", "what can we merge", "simplify review", or
  /callbell-review.
type: skill
edit: locked
---

# Callbell Review

Review a diff (code) or a filing, structure, or docs change (ops) for needless complexity. One line per
finding: location, what to cut, what replaces it. The best outcome is that the change gets shorter or
leaner. Over-engineering and redundancy only, not correctness (that is a normal review).

Read the lens once from `PROJECT TYPE` in session context: **code** hunts complexity in code, **ops** hunts
over-structuring in the tree. Unknown? Derive it from what the change touches.

## Format

`<loc>: <tag> <what>. <replacement>.` where `<loc>` is `L<line>` or `<file>:L<line>` (code), or the `<path>`
(ops).

Tags, by lens:

- shared `delete:` dead code or a dead folder, unused flexibility, a speculative or orphaned thing. Replacement: nothing.
- shared `shrink:` same logic or statement, fewer lines. Show the shorter form.
- code `stdlib:` hand-rolled thing the standard library ships. Name the function.
- code `native:` dependency or code doing what the platform already does. Name the feature.
- code `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- ops `merge:` two files or areas say the same thing. Name the target.
- ops `flatten:` needless depth (a tree for a few files). Flat with a prefix.
- ops `backbone:` text repeats what a rule or `framework.md` already governs. Cut it, point to the backbone.

## Output

One line per finding, ranked biggest cut first. Close with the metric that matters: `net: -<N> lines
possible.` (code) or `net: -<N> files/folders possible.` (ops). Nothing to cut: `Lean already. Ship.`

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you considered whether all these rules are needed?"

✅ code `L12-38: stdlib: 27-line validator class. "@" check in 1 line, real validation is the confirmation mail.`
✅ code `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`
✅ ops `business-finance/2024/invoices/: flatten: folder tree for 3 files. Flat with a fact prefix.`
✅ ops `business-finance/framework.md: backbone: repeats the frontmatter rule. Cut it, the rule applies anyway.`

## Boundaries

Scope: over-engineering and redundancy only. Correctness bugs, security holes, performance, data
protection, and missing guardrails are out of scope, route them to a normal review. A single smoke test or
`assert`-based self-check is the callbell minimum, never flag it for deletion. Lists findings, changes
nothing. One-shot. "stop callbell-review" or "normal mode": revert to the detailed review style.
