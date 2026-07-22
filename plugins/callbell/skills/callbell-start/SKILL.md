---
name: callbell-start
description: >
  The way into callbell and the first stop in a folder: checks dependencies and scaffold, adds what's
  missing, settles purpose and roles once. Runs every time, reports only what's missing, and in a set-up repo
  stays down to one line. Triggers: /callbell-start, "set up", "get started", "what's missing here", or a
  folder callbell has never run in.
type: skill
edit: locked
---

# callbell-start

The way in, not a repair tool: the stop where a session in a folder begins. Check once, add what's missing, then work.

The hook already reports state every session; here you act, not re-report. Call it when you arrive in a folder or when something's missing that only an action closes: create a scaffold, git init, settle purpose and roles. A dependency can vanish between two sessions (new machine, uninstall, changed PATH), so re-check on every run and cache nothing.

The one rule to hang on: in a set-up repo, say one line. Never name what's already there. A run with no findings is one line and the handoff to real work; otherwise no one calls it a fourth time, and then it's no longer a way in.

A language argument applies to this run only. Called with a language (e.g. `/callbell-start english`), run the check, questions, and report in that language. A bare invocation carries no language signal, unlike a typed message, and this argument stands in for it. It holds for this run alone: don't write the language down anywhere, not in the ruleset, not elsewhere. How the user keeps it permanently is their business and is in the README, see step 3.

`<plugin-root>` below is the folder this skill loaded from: the session context names it as `CALLBELL PLUGIN ROOT`, otherwise it's two levels above this `SKILL.md`. Never type a fixed path there; it carries the version number and is wrong after the next update.

Before you check, secure the norms. If the session context already pointed you at the core norms (`Callbell norms. Read these files NOW`), there's nothing to do: the hook delivered them. Otherwise, and this is the first Codex session after an update where the trust gate still swallows the hook, read `<plugin-root>/rules/core/*.md` now; if a `__callbell__/` scaffold is present or you're creating it in step 2, also `<plugin-root>/rules/scaffold/*.md`. You act squarely in their area, so they apply without exception.

## 1. Check (one call)

```
node <plugin-root>/scripts/callbell-doctor.js
```

If the call itself fails, that's the answer: Node is missing. This is the one finding that halts work rather than accompanying it. The context hook is itself Node, so without it neither rules nor context nor backlog load, leaving only the hand-called skills. Say so plainly, name [nodejs.org](https://nodejs.org), and that Windows needs a fresh terminal after install for PATH to take. Don't continue without Node.

The script reports `MISSING`, `NOTES`, `CREATED`, and `OK: nothing missing.` when nothing is pending. It reports only what's missing; what's there doesn't appear.

## 2. Add, then report

In this order. Do first, then say: the report names what came into being, and can only do that once it exists. Report first and you're reporting on a folder you should have just created yourself, then stopping.

If the script reports a missing scaffold, `.gitignore`, or ruleset, create it all at once. No question, no announcement, in the same move:

```
node <plugin-root>/scripts/callbell-doctor.js --apply
```

The script copies only what's missing. It never compares contents, never overwrites, and appends to `.gitignore` rather than replacing it. The lines in it belong to the user; overwriting them would be data loss. If both ruleset files are missing, `--apply` creates them: `AGENTS.md` from the template carries the content, `CLAUDE.md` is the one line `@AGENTS.md`. If either already exists, it touches neither; that belongs to the user.

Two findings need a decision and are asked, never done:
- **no git repo:** offer `git init`.
- **git identity missing:** ask what name and email the commits should carry, usually the GitHub name and the no-reply address. Never take an identity from the session and never invent one. Offer global (`--global`) or this repo only.

The ruleset now stands as an empty scaffold; you ask only for its *content* (purpose and roles), added in step 3. If it stays absent for now, that's no reason not to create anything.

If the user wants a check gone for good (typically `git lfs`), enter its key in `~/.callbell/settings.json` under `mute`: `{"mute": ["git lfs"]}`. That holds user decisions, never findings, and never a path: a value that needs a path to hold belongs in the project, because paths break on every rename, clone, and worktree.

### Then the report

Two lines, in the user's language, without quoting the script lines. First what came into being, then what's missing, each with names rather than prose:

```
✅ Created: __callbell__/, .gitignore, AGENTS.md, CLAUDE.md
❗ Missing: git repo

More: callbell-help
```

Name the skill without prefix. The slash is one host's spelling, and others call the same skill differently.

A line drops if it would be empty. Mention `NOTES` only when they matter for the next step.

What was already there appears nowhere. The user wants to know what happened and what's still open, not what was already fine. So in a set-up repo it stays at the one line from step 1, and a `👍` in front is enough.

## 3. Purpose and roles (once, in the ruleset)

The agent needs two things beyond the scaffold: what this repo is and who it works with. Both live in the user's ruleset (`AGENTS.md` / `CLAUDE.md`), not in a callbell-owned file.

Add only content here, create no more files: those have existed since step 2. Determine the content file, read it, ask only about what's missing. The script says which rulesets exist:

- **Exactly one present** (`AGENTS.md` or `CLAUDE.md`): that's it.
- **Both present and one imports the other** (a line that's just `@file.md`): the imported one holds. The importing one is a switch, not content, and appending there writes past the actual ruleset. This is also the freshly created repo's case: step 2 wrote `CLAUDE.md` as an `@AGENTS.md` switch, so `AGENTS.md` is the content one.
- **Both present, unconnected:** ask which holds. Two rulesets side by side are a statement about the repo you can't guess.

Read the target file before you ask, and ask only about what's missing. Purpose and roles are two separate findings, not one:

- **Both already there:** you're done, ask nothing. This is the norm from the second run on.
- **One of them there:** ask only about the other. What's described isn't reopened; asking about it tells the user you didn't read their file.
- **Neither there:** both questions, see below.

Add by appending, never replacing. The file belongs to the user, same rule as `.gitignore`. Write only after confirmation. If the user doesn't give the content yet ("just a test project, info later"), that's no reason to push: the files stand as a template, you add the content when it comes.

Keep the conversation short, at most two questions, and ask those at once. Ask them as text, never through a selection tool. Both answers are free, and preset options would put the user's own project in their mouth.

1. **Purpose and scope:** what the repo is for, what deliberately doesn't belong, and whether it's private (the agent assumes public otherwise).
2. **Roles and style:** who the user is, how independently the agent should act, and the two separate axes of verbosity (brief or detailed) and tone (direct or warm).

The interaction language is not asked here and not managed by callbell: it's per user across all projects and lives in their machine-local agent file (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`). How to set it there is in the README.

## 4. Close

One or two sentences, no more. Note that `__callbell__/` now exists and carries the callbell-managed layer (backlog, memory, zones, templates); the folder explains itself in its `README.md` if the user asks. You already pointed at `callbell-help` in step 2, so don't again. Don't explain the rest unasked; whoever wants more asks.

If nothing needed doing, the close is the one line from step 1 and you move on to work.
