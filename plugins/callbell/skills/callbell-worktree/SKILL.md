---
name: callbell-worktree
description: >
  Set up a git worktree for parallel work: a new branch in its own folder sharing one git database, so
  separate threads never collide. Cleans up after the merge. Start it by typing /callbell-worktree.
type: skill
edit: locked
disable-model-invocation: true
argument-hint: "[branch-name]"
---

# /callbell-worktree

Open a second working thread with `git worktree`, without stashing the open state in the main folder. For running several sessions or topics at once.

## When
- On the user's direct request.
- When parallel or colliding work comes up (a new thread while a branch is open): propose a worktree, explain it in a sentence or two, and create it only after approval (it's a new structural element).
- For a parallel thread, also propose its own backlog project `__callbell__/backlog/<project>/`. It isolates that thread's backlog changes so the worktrees don't collide on shared files.

## Set up
1. Check state (`git status`); save open changes in the main folder (commit or stash).
2. Pick a branch name (from the argument or a short question), descriptive and in kebab-case.
3. Create the worktree as a sibling folder next to the repo, named `<repo>-wt-<purpose>`:
   `git worktree add ../<repo>-wt-<purpose> -b <branch>`.
4. Tell the user the location, the branch, and how to switch to it.

The `-wt-` infix carries weight, not decoration. A worktree often lands inside another repo's working tree (a repo nested in a repo, a steering repo that drives a codebase), and that outer repo must ignore it. `*-wt-*/` catches every worktree at any depth and nothing else. Naming it `<repo>-<purpose>` instead would force the outer repo to ignore a whole name prefix, which then swallows every future folder that starts the same way, a callbell repo's `backlog/<repo>-*` project folders included.

Put the purpose in the folder name, not a reusable slot number. The name is what makes an unmerged worktree stand out, and what makes clear the folder should be gone once the thread is merged.

## Clean up
- Once the thread is merged or dropped: `git worktree remove <location>` and clean up the branch. Leave no orphaned worktrees.
- `git worktree list` shows what's open.

## Limits
- Never check out the same branch in two worktrees at once (git forbids it).
- A worktree shares the git database but not the local working state: re-provide environment files (`.env`, local config) as needed.
