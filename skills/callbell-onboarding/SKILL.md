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
only after confirmation, and invite questions at any time. The **two exceptions** are standalone gates,
asked strictly on their own and never bundled with another question: the language gate (step 1) and the
familiarity gate (step 2).

## 1. Language first (a hard gate, on its own)
Ask which language the agent should use for **chat replies and visible reasoning** as a **single, standalone
question**. Ask **nothing else** in the same step, in particular **not** the lens (step 3): a user who is
weak in English must not face an English follow-up before the language is set. Wait for the answer, adopt it
**immediately** for everything that follows, and only then move on, every later question posed in the chosen
language. Then anchor it in the user's **personal, machine-local** agent instructions, so it holds across
every session and every project and never enters the shared repo:
- **Where:** the harness's user-global instructions file, for **Claude** `~/.claude/CLAUDE.md`, for **Codex**
  `~/.codex/AGENTS.md`. Create the file if it is missing.
- **What:** a single plain line naming the language for chat and visible reasoning, phrased in that language
  (for German, `Antworte mir immer auf Deutsch (Chat und sichtbares Reasoning).`). No heading, no HTML
  comment, no callbell branding, this is the user's own file.
- **Idempotent:** read the file first; if it already states an interaction language, keep that and add nothing.

This is the **interaction** language (how the agent talks), a per-user property that is deliberately **not**
committed to the repo. The language of repo **content** (folder and area names) is a separate axis, committed
in `repo.md` and set in step 5.

## 2. Familiarity next (a standalone gate, on its own)
Right after the language gate and **before** the lens, ask one standalone question and **nothing else**:
does the user already know the callbell onboarding? Two options, each with a one-line description:
- **Yes, I know it** ("done this before, I know the process") sets **express mode**.
- **No, guide me** ("never, or not often enough, walk me through it") sets **guided mode**.

The answer sets the **depth of the rest**, and only that. It changes how much you **explain**, never which
project data you **gather**: language, lens, purpose, roles, and areas are asked in both modes.
- **Guided:** explain as you go, keep the briefing (step 7) full, and offer the `__callbell__` deep-dive at
  the end (step 8).
- **Express:** skip the teaching, compress the briefing to one line, and at the end just name the
  `__callbell__` folder, no offer.

## 3. The lens, then its sub-question
Read `PROJECT TYPE` from session context (**code** or **ops**) and **confirm it with the user** before
proceeding: the fallback detection can be wrong before the lens is written down in step 5, so never take it
as given, and on unknown or ambient ask outright. Then, right away, its sub-question with a one-line
description:
- **ops:** Personal OS, Business OS, or **Mixed** (personal and business in one repo, typical for solo
  entrepreneurs and freelancers). You record the choice in `repo.md` in step 5.
- **code:** the tech stack in broad strokes and the stage it is at. The deployment path (Full/Clean) comes
  in step 6.

## 4. Materialize the scaffold (once the lens is known)
**If this folder has no `__callbell__/`**, you were started as the device-global plugin in a bare folder
(ambient mode). Lay the **project scaffold** into the current folder from the plugin's bundled copy at
`${CLAUDE_PLUGIN_ROOT}/skills/callbell-onboarding/scaffold/`. The plugin delivers rules, skills, hook, and
ruleset device-global (the hook injects them, project-local wins), so the scaffold carries **only project
state**, never a second copy of those:
- Copy the shared base verbatim: `__callbell__/` (the structural header `README.md`, context, memory index,
  template scaffolds), the backlog index `__callbell__/backlog/BACKLOG.md`, and the two zones
  `__callbell__/zone-import/.gitkeep` and `__callbell__/zone-export/.gitkeep`.
- Copy `scaffold/gitignore` to `.gitignore` (the dot is dropped in the bundle so it is inert there).
- **Lens extras from `scaffold/_lens/`:** for **ops**, copy `_lens/ops/framework.md` to
  `__callbell__/framework.md` and `_lens/ops/templates/*` into `__callbell__/templates/`; for **code**, copy
  `_lens/code/docs/framework.md` to `__callbell__/docs/framework.md`.

A folder that already carries the scaffold (a template copy) skips this. If `${CLAUDE_PLUGIN_ROOT}` is not
resolvable from the session, ask the user for the plugin's install path.

Then create `__callbell__/backlog/task-initial-onboarding.md` (template in `__callbell__/templates/task.md`,
`status: active`) and add one line to `__callbell__/backlog/BACKLOG.md`. Check off the steps as you go, so
the state survives a pause.

## 5. Gather and fill the context (a few questions per step, write after confirmation)
- **Structure language** (`repo.md`): ask whether folder and area names should follow the chat language, be
  English, or something else. Record it in `repo.md`. Names stay ASCII kebab per `callbell-conventions`
  (German transliterated: ae, oe, ue, ss), whichever language is chosen.
- **Purpose** (`repo.md`): what the repo achieves, scope, non-goals, the people involved. Set
  `project-type: code` or `project-type: ops` in the frontmatter (the durable lens the hook emits), and note
  the ops sub-type (Personal / Business / Mixed) from step 3.
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

## 6. Choose the deployment mode (code only, explain and select)
Explain the two paths and let the user choose (no forced default):
- **Full:** everything for agentic work (`.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `__callbell__/`)
  lives **inside** the repo. Layout `folder/repo-from-template`. Simple, all in one place.
- **Clean:** the template sits **next to** the codebase and steers it from outside, so the codebase stays
  clean (today's dev standard). Layout `folder/{repo-control-from-template/, repo-codebase, …}`.
- Full can later become Clean, not easily the other way around.

## 7. Brief the user
Adapt to the mode from step 2. In **express mode**, collapse the whole briefing to one line (the layer
split: `__callbell__/` is callbell-managed, the root is your content) and move straight to step 8. In
**guided mode**, brief in full:
- **Roles:** the user decides and reviews, the agent executes in a structured and largely autonomous way.
- **Language:** your interaction language lives in your personal machine-local agent file (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`), not in the repo; the content/structure language lives in `repo.md`.
- **Rules and skills:** the rules apply (conventions, frontmatter, zones, backlog, memory, data protection,
  Git, for ops also structure, and more); `/callbell-help` shows the skills.
- **Approvals:** structure and schema changes (and new areas in ops) and the promotion of drafts happen only
  after approval; routine within the established scope the agent handles itself.
- **Structure:** the path says WHERE, the frontmatter says WHAT, `status` drives maturity. The
  callbell-managed layer is `__callbell__/`; your content sits in the root (docs in `__callbell__/docs/` for
  code, flat area folders `<area>-<topic>` for ops). The versioned work trail is `__callbell__/backlog/`;
  the two volatile zones are `__callbell__/zone-import/` (inputs) and `__callbell__/zone-export/` (deliverables).

## 8. Wrap-up
- If no Git repo is initialized yet, point it out and offer `git init` (only after confirmation).
- Git identity (before the first commit): if `git config user.name`/`user.email` is unset, ask which name
  and email the commits should carry, usually the user's GitHub username and their GitHub no-reply/alias
  email, and offer to set it globally (`git config --global`, the friendly default when they have none) or
  only for this repo. Never use a harness or session identity, and never invent one (see `callbell-git`).
- **Name the `__callbell__` folder as the close:** state plainly that a `__callbell__/` folder now sits in
  the project, the callbell-managed layer for project management (the backlog) and other metadata (context,
  memory, templates). In **guided mode**, then ask actively whether the user wants to understand why it
  exists and what it holds; only if they say yes, explain it from `__callbell__/README.md` (the single
  source, so the skill and the folder never drift). In **express mode**, this naming is enough, no offer.
- Summarize what was set up and what the user can do next.
- Set `task-initial-onboarding.md` to `status: final`, move it into `__callbell__/backlog/done/`, and remove
  its line from `__callbell__/backlog/BACKLOG.md` (the index lists only active work).
