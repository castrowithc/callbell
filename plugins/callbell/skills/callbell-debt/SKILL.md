---
name: callbell-debt
description: >
  Harvest every `callbell:` marker in the repo or workspace into a debt ledger, so the deliberate shortcuts
  and deferrals callbell leaves behind get tracked instead of rotting into "later means never". Use on
  "callbell debt", "/callbell-debt", "what did callbell defer", "list the shortcuts", "callbell ledger", or
  "what did we mark to do later". One-shot report, changes nothing.
type: skill
edit: locked
---

# Callbell Debt

Every deliberate callbell shortcut is marked with its ceiling and upgrade path: a code comment
`// callbell: <ceiling>, <upgrade>` (or `#`), or an HTML comment `<!-- callbell: <ceiling>, <upgrade> -->` in
markdown. This harvests them into one ledger, so a deferral cannot quietly become permanent.

## Scan

Grep the tree for both marker forms, skipping `.git`, `node_modules`, and build output:

`grep -rnE '(#|//|<!--) ?callbell:' .`  (add file types or comment prefixes your stack uses)

Every hit is one ledger row. The marker keeps prose that merely mentions the convention out of the ledger.

## Output

One row per marker, grouped by file:

`<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

The convention is `callbell: <ceiling>, <upgrade>`, so pull both straight from the marker. Any marker with
no upgrade trigger gets a `no-trigger` tag, those are the ones that silently rot. Want an owner per row?
add `git blame -L<line>,<line>`.

Close with `<N> markers, <M> with no trigger.` Nothing found: `No callbell debt. Clean ledger.`

## Boundaries

Reads and reports only, changes nothing. To persist it, ask and it writes the ledger to a file (for example
`callbell-debt.md`). One-shot. "stop callbell-debt" or "normal mode": revert.
