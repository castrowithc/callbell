---
name: review
description: >
  Code review focused exclusively on over-engineering, across a diff or a whole
  repo. Finds what to delete: reinvented standard library, unneeded
  dependencies, speculative abstractions, dead flexibility. One line per
  finding: location, what to cut, what replaces it. Start it by typing
  /callbell-dev:review, adding "repo" for a whole-tree pass.
type: skill
edit: locked
disable-model-invocation: true
---

Review code for unnecessary complexity. One line per finding: location, what
to cut, what replaces it. The best outcome is getting shorter.

## Scope

**A diff by default.** That is the common case and the cheapest one: what just
changed, reviewed before it lands.

**The whole tree when asked** — "review the repo", "audit this codebase", "what
can I delete from here", or `/callbell-dev:review repo`. Same lens, same tags,
same output; only the reading changes. Scan the tree instead of the diff and
rank findings biggest cut first, because a repo pass has no natural order the
way a diff does.

If the scope is not obvious from the invocation and a diff exists, take the
diff and say so in one line. Do not ask.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for
multi-file diffs.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Hunt (repo pass)

Where to look when there is no diff to follow: deps the stdlib or platform
already ships, single-implementation interfaces, factories with one product,
wrappers that only delegate, files exporting one thing, dead flags and config,
hand-rolled stdlib.

## Scoring

End with the only metric that matters: `net: -<N> lines possible.` On a repo
pass add the dependencies: `net: -<N> lines, -<M> deps possible.`

If there is nothing to cut, say `Lean already. Ship.` and stop.

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope. Route them to a normal review
pass, not this one. A single smoke test or `assert`-based self-check is the
minimum this pack asks for, not bloat, never flag it for deletion.
Does not apply the fixes, only lists them.
"stop" or "normal mode": revert to verbose review style.
