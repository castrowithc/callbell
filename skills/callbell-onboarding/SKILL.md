---
name: callbell-onboarding
description: >
  Guides the user through the first-time setup of this repo: set the language, clarify the lens and
  context, lay down the scaffold, and brief the user on how the collaboration works. Adapts to a code repo
  or an ops repo. Only on explicit call (/callbell-onboarding), once, never automatically.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-onboarding

You guide the user **actively** through the one-time setup of this repo and stay with it until the repo
holds the information it needs to work. Work in short steps, ask only **a few questions at a time**, write
only after confirmation, and invite questions at any time.

## 1. Language first (before anything else)
Ask which language the agent should use for **chat replies and visible reasoning**, and adopt it
**immediately** for everything that follows (so nothing below is written in the wrong language). Then anchor
it in the root files, so it survives every session and both harnesses load it natively:
- **Empty folder:** create `AGENTS.md` and `CLAUDE.md` (`CLAUDE.md` is just `@AGENTS.md`) and write the
  language into `AGENTS.md` first, as a short `## Interaction language` section.
- **Existing `AGENTS.md`/`CLAUDE.md`:** read them. If the interaction language is already stated, keep it
  (do not ask again). If not, add the `## Interaction language` section.

This is the **interaction** language (how the agent talks), committed with the repo. The language of repo
**content** (folder and area names) is a separate axis, set in step 4.

## 2. The lens, then its sub-question
Read `PROJECT TYPE` from session context (**code** or **ops**); unknown or ambient, confirm which it is.
Then, right away, its sub-question with a one-line description:
- **ops:** Personal OS, Business OS, or **Mixed** (personal and business in one repo, typical for solo
  entrepreneurs and freelancers). You record the choice in `repo.md` in step 4.
- **code:** the tech stack in broad strokes and the stage it is at. The deployment path (Full/Clean) comes
  in step 5.

## 3. Materialize the scaffold (once the lens is known)
**If this folder has no `__callbell__/`**, you were started as the device-global plugin in a bare folder
(ambient mode). Lay the **project scaffold** into the current folder from the plugin's bundled copy at
`${CLAUDE_PLUGIN_ROOT}/skills/callbell-onboarding/scaffold/`. The plugin delivers rules, skills, hook, and
ruleset device-global (the hook injects them, project-local wins), so the scaffold carries **only project
state**, never a second copy of those:
- Copy the shared base verbatim: `__callbell__/` (context, memory index, template scaffolds) and the zones
  `__callbell__/_backlog/BACKLOG.md` and `__callbell__/_import/.gitkeep`.
- Copy `scaffold/gitignore` to `.gitignore` (the dot is dropped in the bundle so it is inert there).
- **Lens extras from `scaffold/_lens/`:** for **ops**, copy `_lens/ops/framework.md` to
  `__callbell__/framework.md` and `_lens/ops/templates/*` into `__callbell__/templates/`; for **code**, copy
  `_lens/code/docs/framework.md` to `__callbell__/docs/framework.md`.

A folder that already carries the scaffold (a template copy) skips this. If `${CLAUDE_PLUGIN_ROOT}` is not
resolvable from the session, ask the user for the plugin's install path.

Then create `__callbell__/_backlog/task-initial-onboarding.md` (template in `__callbell__/templates/task.md`,
`status: active`) and add one line to `__callbell__/_backlog/BACKLOG.md`. Check off the steps as you go, so
the state survives a pause.

## 4. Gather and fill the context (a few questions per step, write after confirmation)
- **Structure language** (`repo.md`): ask whether folder and area names should follow the chat language, be
  English, or something else. Record it in `repo.md`. Names stay ASCII kebab per `callbell-conventions`
  (German transliterated: ae, oe, ue, ss), whichever language is chosen.
- **Purpose** (`repo.md`): what the repo achieves, scope, non-goals, the people involved. Set
  `project-type: code` or `project-type: ops` in the frontmatter (the durable lens the hook emits), and note
  the ops sub-type (Personal / Business / Mixed) from step 2.
- **Roles and style** (`roles.md`): your role, the **agent's stance** (how autonomous: autonomous and
  structured / propose-then-act / closely guided), and **two separate style axes** — detail (concise vs
  detailed) and tone (direct vs warm). Plus any **special rules or wishes** beyond the fixed rules. Note:
  this is how the agent *talks and decides*, separate from the callbell **level** (muffin/cake/buffet),
  which governs how lazy the *building* is and is set with `/callbell`, not here.
- **ops, areas:** do **not** present a fixed menu. Ask which areas the user wants to start with, in the
  format `<area>-<topic>` (for example `business-finance`), or none for now (lazy). Invent nothing, create no
  empty folders. Fill the named ones into the area registry `__callbell__/framework.md`.
- **code:** point to `__callbell__/docs/` as the place for project documentation; the root stays the code
  project.
- **Terms:** if a term of the user's own comes up, offer to capture it in `glossary.md`.

## 5. Choose the deployment mode (code only, explain and select)
Explain the two paths and let the user choose (no forced default):
- **Full:** everything for agentic work (`.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `__callbell__/`)
  lives **inside** the repo. Layout `folder/repo-from-template`. Simple, all in one place.
- **Clean:** the template sits **next to** the codebase and steers it from outside, so the codebase stays
  clean (today's dev standard). Layout `folder/{repo-control-from-template/, repo-codebase, …}`.
- Full can later become Clean, not easily the other way around.

## 6. Brief the user
- **Roles:** the user decides and reviews, the agent executes in a structured and largely autonomous way.
- **Language:** the interaction language lives in `AGENTS.md`; the content/structure language in `repo.md`.
- **Rules and skills:** the rules apply (conventions, frontmatter, zones, backlog, memory, data protection,
  Git, for ops also structure, and more); `/callbell-help` shows the skills.
- **Approvals:** structure and schema changes (and new areas in ops) and the promotion of drafts happen only
  after approval; routine within the established scope the agent handles itself.
- **Structure:** the path says WHERE, the frontmatter says WHAT, `status` drives maturity. The
  callbell-managed layer is `__callbell__/`; your content sits in the root (docs in `__callbell__/docs/` for
  code, flat area folders `<area>-<topic>` for ops). Zones: `__callbell__/_import/` inputs,
  `__callbell__/_export/` requested deliverables, `__callbell__/_backlog/` the work trail.

## 7. Wrap-up
- If no Git repo is initialized yet, point it out and offer `git init` (only after confirmation).
- Git identity (before the first commit): if `git config user.name`/`user.email` is unset, ask which name
  and email the commits should carry, usually the user's GitHub username and their GitHub no-reply/alias
  email, and offer to set it globally (`git config --global`, the friendly default when they have none) or
  only for this repo. Never use a harness or session identity, and never invent one (see `callbell-git`).
- Summarize what was set up and what the user can do next.
- Set `task-initial-onboarding.md` to `status: final`, move it into `__callbell__/_backlog/done/`, and remove
  its line from `__callbell__/_backlog/BACKLOG.md` (the index lists only active work).
