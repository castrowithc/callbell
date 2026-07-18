---
name: callbell-worktree
description: >
  Sets up a git worktree for parallel work: a new branch in its own folder, the same
  git database. On request or after a proposal; cleans up again after the merge.
type: skill
edit: locked
argument-hint: "[branch-name]"
---

# /callbell-worktree

Sets up a second line of work through `git worktree`, without clearing away the open state in the main
folder. For several sessions or topics at the same time.

## When
- On a direct request from the user.
- Or when parallel or colliding work comes up (a new strand while a branch is open): propose a worktree,
  explain it in a sentence or two, and create it only after approval (a new structural element, see
  `callbell-governance`).
- For a parallel strand, also suggest a dedicated backlog project `__callbell__/backlog/<project>/`: it isolates that
  strand's backlog changes so the worktrees do not collide on shared files (see `callbell-backlog`).

## Setup
1. Check the state (`git status`), secure open changes in the main folder (commit or stash).
2. Settle the branch name (from the argument or a quick question), descriptive and kebab-case.
3. Create the worktree as a sibling folder next to the repo: `git worktree add ../<repo>-<branch> -b <branch>`.
4. Tell the user the location and branch and how to switch there.

## Cleanup
- Once the strand is merged or dropped: `git worktree remove <location>` and clean up the branch. Leave no
  orphaned worktrees.
- `git worktree list` shows what is open.

## Boundaries
- Never check out the same branch in two worktrees at once (Git forbids it).
- The worktree shares the git database but not the local working state: re-provide environment files
  (`.env`, local configs) when needed.
