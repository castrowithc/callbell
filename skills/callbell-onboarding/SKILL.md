---
name: callbell-onboarding
description: >
  Guides the user through the first-time setup of this repo: clarify context, gather information, fill the
  scaffolds, and brief the user on how the collaboration works. Adapts to a code repo or an ops repo. Only
  on explicit call (/callbell-onboarding), once, never automatically.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-onboarding

You guide the user **actively** through the one-time setup of this repo and stay with it until the repo
holds the information it needs to work. By the end the agent knows what this is about and how work is done,
and the user understands the collaboration model. Work in short steps, ask only **a few questions at a
time**, write only after confirmation, and invite questions at any time.

Read the lens once from `PROJECT TYPE` in session context (**code** or **ops**); it shapes what you ask and
what you scaffold. Unknown or ambient? Confirm with the user which it is, first.

## 0. Materialize the scaffold, then secure progress (first)
**If this folder has no callbell scaffold** (no `__callbell__/`), you were started as the device-global plugin
in a bare folder (ambient mode). Lay the **project scaffold** into the current folder from the plugin's
bundled copy at `${CLAUDE_PLUGIN_ROOT}/skills/callbell-onboarding/scaffold/`. The plugin already delivers the
rules, skills, hook, and ruleset device-global (the SessionStart hook injects them, project-local wins), so
the scaffold carries **only project state**, never a second copy of those:

- Copy the shared base verbatim into the current folder: `__callbell__/` (context, memory index, template
  scaffolds), the zones `__callbell__/_backlog/BACKLOG.md` and `__callbell__/_import/.gitkeep`, and `_user-language.example.md`.
- Copy `scaffold/gitignore` to `.gitignore` (the dot is dropped in the bundle so it does not act as an
  ignore file inside the plugin).
- **Lens extras from `scaffold/_lens/`:** for **ops**, copy `_lens/ops/framework.md` to
  `__callbell__/framework.md` and `_lens/ops/templates/*` into `__callbell__/templates/`; for **code**, copy
  `_lens/code/docs/framework.md` to `__callbell__/docs/framework.md`.

A folder that already carries the scaffold (a template copy) skips this. If `${CLAUDE_PLUGIN_ROOT}` is not
resolvable from the session, ask the user for the plugin's install path.

Then create `__callbell__/_backlog/task-initial-onboarding.md` right away (template in `__callbell__/templates/task.md`,
`status: active`) and add one line to the backlog index `__callbell__/_backlog/BACKLOG.md`. Check off the steps as you
go, so the state survives a pause.

## 1. Clarify context
- **code:** what the project is about, the tech stack in broad strokes, and what stage it is at.
- **ops:** what the repo is used for, Business OS, Personal OS, or both (solo entrepreneur or freelancer).
  The rest follows from that.

## 2. Gather information (a few questions per step)
- **Language first** (root `_user-language.md`): confirm which language the agent uses for chat replies and
  its visible reasoning, then write `_user-language.md` (copy `_user-language.example.md`) so the rest runs
  in it. Skip if it exists. Per user, gitignored; it does not set the language of repo content.
- **Purpose** (for `repo.md`): what the repo achieves, scope, non-goals, the people involved.
- **Roles** (for `roles.md`): your role, the **agent's role** (stance and initiative), communication style,
  likes and dislikes, and **special rules or wishes** beyond the fixed rules (these go in `roles.md`, not in
  `.claude/rules/`, which are fixed; `context/` is the dynamic complement).
- **ops only, areas:** which areas already exist, in the format `<area>-<topic>` (for example
  `business-finance`, `personal-gaming`). Invent nothing.
- **Terms:** if a term of the user's own comes up, offer to capture it in `glossary.md`.

## 3. Fill the scaffolds (after confirmation)
- `__callbell__/context/repo.md` with purpose, scope, non-goals, and the people involved, and set
  `project-type: code` (code) or `project-type: ops` (ops) in its frontmatter (the durable lens the
  SessionStart hook emits as `PROJECT TYPE`).
- `__callbell__/context/roles.md` with your role, the desired agent role, and special rules.
- For any terms mentioned, `__callbell__/context/glossary.md`.
- **code:** point to `__callbell__/docs/` as the place for project documentation; the root stays the code project.
- **ops:** fill the area registry in `__callbell__/framework.md` with the named areas. Create no empty area
  folders yet; a folder comes into being only when something goes into it (lazy).

## 4. Choose the deployment mode (code only, explain and select)
Explain the two paths and let the user choose (no forced default):
- **Full:** everything for agentic work (`.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `__callbell__/_backlog/`,
  `__callbell__/`) lives **inside** the repo. Layout `folder/repo-from-template`. Simple, all in one place.
- **Clean:** the template sits **next to** the codebase and steers it from outside, so the codebase stays
  clean (today's dev standard). Layout `folder/{repo-control-from-template/, repo-codebase, …}`.
- Full can later become Clean, not easily the other way around.

## 5. Brief the user
- **Roles:** the user decides and reviews, the agent executes in a structured and largely autonomous way.
- **Rules and skills:** the rules in `.claude/rules/` apply (conventions, frontmatter, zones, backlog,
  memory, data protection, Git, for ops also structure, and more); `/callbell-help` shows the skills.
- **Approvals:** structure and schema changes (and new areas in ops) and the promotion of drafts happen
  only after approval; routine within the established scope the agent handles itself.
- **Structure:** the path says WHERE, the frontmatter says WHAT, `status` drives maturity. Docs in
  `__callbell__/docs/` (code) or flat area folders `<area>-<topic>` (ops). Zones: `__callbell__/_import/` inputs, `__callbell__/_export/`
  requested deliverables, `__callbell__/_backlog/` the work trail.

## 6. Wrap-up
- If no Git repo is initialized yet, point it out and offer `git init` (only after confirmation).
- Git identity (before the first commit): if `git config user.name`/`user.email` is unset, ask which name
  and email the commits should carry, usually the user's GitHub username and their GitHub no-reply/alias
  email, and offer to set it globally (`git config --global`, the friendly default when they have none) or
  only for this repo. Never use a harness or session identity, and never invent one (see `callbell-git`).
- Summarize what was set up and what the user can do next.
- Set `task-initial-onboarding.md` to `status: final`, move it into `__callbell__/_backlog/done/`, and remove its line
  from `__callbell__/_backlog/BACKLOG.md` (the index lists only active work).
