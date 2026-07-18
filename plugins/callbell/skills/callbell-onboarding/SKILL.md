---
name: callbell-onboarding
description: >
  Guides the user through the first-time setup of this repo: clarify the lens and context, lay down the
  scaffold, and brief the user on how the collaboration works. Adapts to a code repo or an ops repo. Takes
  an optional argument: `bare` lays the scaffold down without the interview, `top-up` brings an existing
  scaffold up to the shipped one additively. Only on explicit call (/callbell-onboarding), never
  automatically.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-onboarding

## 0. Which mode (read the argument and the folder first)
Three situations, and only the first is the full interview. Decide before asking anything.

- **`top-up`** (or any folder that already has `__callbell__/`): do **not** run the interview. Go straight
  to step 3a. The repo is already set up; what it needs is the newer scaffold's missing pieces.
- **`bare`**: lay the scaffold down and ask nothing. Take the lens from `PROJECT TYPE` in session context;
  only if that says `unknown` ask that one question, because nothing else can answer it. Do step 3, stamp
  the version, and stop — no purpose, no roles, no areas, no briefing. Close by saying the scaffold is
  there, that `repo.md` and `roles.md` are still templates, and that `/callbell-onboarding` fills them in
  whenever the user wants. This exists because the interview is right for setting up a project and far too
  much when someone just wants the folder so the session has a backlog.
- **no argument, no `__callbell__/`**: the full guided setup below, from step 1.

You guide the user **actively** through the one-time setup of this repo and stay with it until the repo
holds the information it needs to work. Work in short steps, ask only **a few questions at a time**, write
only after confirmation, and invite questions at any time. The **one exception** is the familiarity gate
(step 1), asked strictly on its own and never bundled with another question.

The **interaction** language is not asked here: it is a per-user, cross-project property that `callbell-language`
handles on its own, in any session, including the ones that never reach this skill. The language of repo
**content** (folder and area names) is a separate axis, committed in `repo.md` and set in step 4.

## 1. Familiarity first (a standalone gate, on its own)
**Before** the lens, ask one standalone question and **nothing else**:
does the user already know the callbell onboarding? Two options, each with a one-line description:
- **Yes, I know it** ("done this before, I know the process") sets **express mode**.
- **No, guide me** ("never, or not often enough, walk me through it") sets **guided mode**.

The answer sets the **depth of the rest**, and only that. It changes how much you **explain**, never which
project data you **gather**: lens, purpose, roles, and areas are asked in both modes.
- **Guided:** explain as you go, keep the briefing (step 6) full, and offer the `__callbell__` deep-dive at
  the end (step 7).
- **Express:** skip the teaching, compress the briefing to one line, and at the end just name the
  `__callbell__` folder, no offer.

## 2. The lens, then its sub-question
Read `PROJECT TYPE` from session context (**code** or **ops**) and **confirm it with the user** before
proceeding: the fallback detection can be wrong before the lens is written down in step 4, so never take it
as given, and on unknown or ambient ask outright. Then, right away, its sub-question with a one-line
description:
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
- Copy the shared base verbatim: `__callbell__/` (the structural header `README.md`, context, memory index,
  template scaffolds), the backlog index `__callbell__/backlog/BACKLOG.md`, and the two zones
  `__callbell__/zone-import/.gitkeep` and `__callbell__/zone-export/.gitkeep`.
- **`.gitignore`: append, never replace.** The bundle carries the rules as `scaffold/gitignore` (the dot is
  dropped so the file is inert there). With no `.gitignore` in the repo, copy it. With one already present,
  check whether it already ignores `__callbell__/zone-import/`; if it does, change nothing, and if it does
  not, append the bundle's content verbatim (comments included) after a blank line. Every existing line
  stays untouched — those rules are the user's, and overwriting them is data loss. One check, no merging,
  and a second run adds nothing.
- **Lens extras from `scaffold/_lens/`:** for **ops**, copy `_lens/ops/framework.md` to
  `__callbell__/framework.md` and `_lens/ops/templates/*` into `__callbell__/templates/`; for **code**, copy
  `_lens/code/docs/framework.md` to `__callbell__/docs/framework.md`.

- **Stamp the version, always and last.** Read the plugin's `VERSION` and write it into `repo.md`
  frontmatter as `scaffold-version: <version>`. The hook compares that stamp against the shipped `VERSION`
  and reports drift, so an unstamped scaffold reads as outdated forever. This is the one frontmatter field
  the user never edits.

A folder that already carries the scaffold goes to step 3a instead. If `${CLAUDE_PLUGIN_ROOT}` is not
resolvable from the session, ask the user for the plugin's install path.

Then create `__callbell__/backlog/task-initial-onboarding.md` (template in `__callbell__/templates/task.md`,
`status: active`) and add one line to `__callbell__/backlog/BACKLOG.md`. Check off the steps as you go, so
the state survives a pause. In **bare** mode skip that task — there is no interview to track.

## 3a. Top-up: an existing scaffold, brought up to the shipped one
**Additive only, and that is the whole design.** Copy in what is **absent**; touch nothing that is
**present**. Do not compare contents, do not merge, do not offer to "update" a file the user has edited —
their `repo.md` is theirs, and not diffing it is precisely why their edits survive. There is no downgrade
and no migration path here; a scaffold newer than the plugin is left alone.

- Walk the bundle (shared base plus the lens extras for this repo's `project-type`) and add every file the
  repo does not have, creating folders as needed.
- Apply the `.gitignore` step the same way as in step 3: check, append if the zone rules are missing, never
  replace.
- Rewrite `scaffold-version` in `repo.md` to the plugin's `VERSION`, last.
- Report what you added, as a list, plus the fact that nothing existing was changed. If nothing was
  missing, say that and only restamp.

Do not run the interview and do not create an onboarding task: this repo was onboarded already.

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
Adapt to the mode from step 1. In **express mode**, collapse the whole briefing to one line (the layer
split: `__callbell__/` is callbell-managed, the root is your content) and move straight to step 7. In
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

## 7. Wrap-up
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
