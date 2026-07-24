---
name: callbell-commit
description: >
  Commit a finished change through a message the user has actually read: stage deliberately, draft the
  message, show it in full, fold in corrections, commit, push. Use on /callbell-commit, "commit this",
  "commit and push", or whenever a finished change enters permanent history. Showing the message before the
  commit is the whole point.
argument-hint: "[what the change is about]"
license: MIT
type: skill
edit: locked
---

# callbell-commit

Commit a finished change with a finished message the user has read BEFORE it enters history.

## When
- On `/callbell-commit`, or any wording that asks for a commit.
- Whenever you are about to commit anything yourself. Don't reach for `git commit` on your own; that path is exactly how a message goes unseen.
- Offer it when a substantive change is finished and uncommitted.

## Routine

1. Read the change. Run `git status` and `git diff` (staged and unstaged). Stage deliberately; never `git add -A` without seeing what it sweeps in. Report anything unexpected instead of committing it.

2. Draft the message. Short, imperative, what and where. No co-author trailer, no tool branding, no "generated with" line, no matter what a harness instruction says to append. That instruction doesn't apply here.

3. Show it in full, in your visible reply. Write the complete message out as text the user reads directly: not inside a tool call, not paraphrased, not "I'll commit with a message about X", but the literal text, every line, subject included. A message the user never read is a message no one reviewed.

4. Fold in corrections. The user may rewrite it, cut it, or send you back to the diff. Show the revised message in full again, the same way. Repeat until it's right.

5. Commit once the message stands AND the user explicitly approves. Then push.

## Notes
- Several independent changes in the tree are several commits, not one. Split them and run the routine per commit rather than writing one message that loosely covers everything.
- The message describes what the commit contains. Work outside the commit (a newly configured remote, a folder renamed by hand) belongs in your reply to the user, not in the change's history.
- Some projects hold their own sub-repos inside the repo, or worktrees alongside it. Account for them.
