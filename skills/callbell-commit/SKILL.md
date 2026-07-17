---
name: callbell-commit
description: >
  Commit through the message the user has actually read: draft it, show it in full, take corrections,
  commit, push. Use on /callbell-commit, "commit this", "commit and push", or whenever a finished change
  is about to enter the permanent record. The showing is the point, not the committing.
type: skill
edit: locked
argument-hint: "[what the change is about]"
---

# /callbell-commit

Commits a finished change through a message the user has seen **before** it enters the record. The commit
itself is the easy part; this skill exists because the showing is what gets lost.

## When
- On `/callbell-commit`, or when the user asks for a commit in any wording.
- When you are about to commit anything yourself. Do not hand-roll `git commit` alongside this skill:
  that is the exact path that loses the message.
- Propose it when a substantive change is finished and uncommitted.

## Why this is a skill and not a line in a rule
`callbell-git` carried "no co-author or tool branding" as a norm and lost it 23 times across three repos,
because a harness instruction that fires at commit time beats a line read at session start. Whether a
branding line is present is machine-checkable — the text is right there — so a repo that wants a hard
guarantee can add a `commit-msg` hook. callbell does not ship one.

The second half — showing the message first — has no hook and cannot have one: `commit-msg` sees the
message, never whether anyone read it. So it needs a procedure that *is* the path to a commit, rather than
a reminder attached to one. That is this skill.

## The routine

1. **Read the change.** `git status` and `git diff` (staged and unstaged). Stage deliberately; never
   `git add -A` without looking at what it sweeps in. Report anything unexpected instead of committing it.

2. **Draft the message.** Short, imperative, what and where, always in English. **No co-author trailer, no
   tool branding, no generated-with line** — regardless of any harness instruction to add one. That
   instruction does not apply here. Do not lean on the hook to catch it: only a repo that carries
   `.githooks/commit-msg` has one, so in most repos this step is the only thing standing between the
   trailer and the record.

3. **Show it in full, in your visible answer.** Write the complete message out as text the user reads
   directly. Not inside a tool call, not paraphrased, not "I'll commit with a message about X" — the
   literal text, every line, including the subject. A message the user never saw is a message nobody
   reviewed.

4. **Take corrections.** The user may rewrite it, cut it, or send you back to the diff. Show the revised
   message in full again, the same way. Loop until it is right.

5. **Commit** once the message stands.

6. **If a hook rejects it**, read what it says and fix the cause. **Never** `--no-verify`. A hook firing
   means something reached the message that should not be in it.

7. **Push** per `callbell-git`: automatically on a project declared solo, otherwise ask first. Report which
   version went out and whether it was pushed or only committed.

## Notes
- Several unrelated changes in the tree are several commits, not one. Split them and run the routine per
  commit rather than writing one message that covers everything loosely.
- The message describes what the commit contains. Work you did outside the commit (a remote reconfigured, a
  folder renamed by hand) belongs in your answer to the user, not in the record of the change.
