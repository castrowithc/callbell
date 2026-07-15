---
paths: ["**/*"]
description: >
  How the agent handles Git and the repo: check the state, fetch what is new, spot conflicts,
  commit and push deliberately. The goal is a safe and tidy repo state.
type: rule
edit: locked
---

# Git Routine

Goal: the repo stays in a safe and tidy state at all times. The agent handles Git with care, checks the
state on its own, and reports anything unusual before acting.

## Session start (always)

- `git fetch`, to see what has come in.
- `git status` and check the divergence from `origin/main`: are there local changes, is the branch ahead
  or behind, are conflicts likely?
- If everything is clean and fast-forward: `git pull` (prefer `--ff-only`). On conflicts or unexpected
  divergence, do not merge blindly, report first.
- Secure uncommitted changes before the pull (commit or stash) so nothing is lost.

## Working and committing

- Before committing, check what changed (`git status`, `git diff`) and stage deliberately, without
  pulling in unwanted files.
- After a finished substantive change: commit and push to `origin` (auto push depends on project type,
  see Safety).
- Leave the working tree tidy: no half-finished or unintended changes left lying around.

## Safety

- No `push --force` and no rewriting of history that is already shared.
- Auto push only on a project declared as solo. On collaborative projects do not push automatically, ask
  actively whether to push. Not negotiable.
- Do not commit secrets, credentials, or personal data (see Data protection).
- Never use a real name or email from the harness in commits or content.
- When in doubt or on conflicts, stop and ask the user rather than guess.

## Conventions

- The default branch is `main`. For larger or self-contained work use a dedicated branch, otherwise
  commit directly to `main`.
- Commit messages: short, imperative, "what and where", no co-author or tool branding, always in English.
- Point it out when no Git globals are set up. Never invent anything.

## Parallel work: worktrees

Multiple strands at once (a second session on a different thing, without clearing away the open state) run
through `git worktree`: a second branch in its own folder, the same Git database.

- **Never silently and automatically.** The agent creates a worktree on request or proposes it
  proactively as soon as parallel or colliding work comes up (a new strand while a branch is open). It is
  created only after approval (a new structural element, see `callbell-governance`).
- **Location** is proposed by the agent (a sibling folder next to the repo), never in the middle of the
  work areas.
- **Cleanup** is part of it: once the strand is merged or dropped, the agent removes the worktree again.
  No orphaned worktrees.
- The procedure is run by the skill `/callbell-worktree`.

## Large files (binaries)

The repo is not an asset store (see `callbell-zones`): large or changing binary data belongs in a file
store, not in the history. If a rare, stable binary file does have to go into the repo, it runs through
**Git LFS**, which replaces the file with a pointer and keeps the history lean.

When proposing this, the agent names the prerequisites: `git-lfs` must be installed on every machine that
clones (otherwise a pointer instead of content), and the host has quotas for storage and bandwidth. The
path mapping lives in `.gitattributes` and travels with the repo.
