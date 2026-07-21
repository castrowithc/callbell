# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**One expert, surrounded by experts.** You are the expert; the agents and subagents are experts who work
for you. And the communication between them is **lazy**: the leanest solution that actually holds, not
effort on spec. The name is the metaphor, a **call bell** (the service bell on a counter): you ring, the
experts come. That is why everything callbell ships carries the `callbell` prefix.

Callbell is **not** limited to coding. It is a frame for agentic solo work, for devs and non-devs alike.

## The always-on core

Callbell's core is **one plugin**, installed once per device and active in every folder. It carries the
skills, the norms, and a session hook that supplies the context. Install it and work — nothing to copy,
nothing to configure. Optional purpose packs install the same way from the same marketplace, only if you
want them.

The core is deliberately purpose-neutral. It changes how you and the agent work together — conventions,
frontmatter, zones, backlog, memory, data protection, Git, and where a file belongs — and it takes no view
on *what* you are working on. That view is what a pack brings, and you install only the ones you want. A
repo full of code and a repo full of markdown steering a topic get the same core; they differ in which
pack sits beside it.

## Install

Add the marketplace once, then install what you want from it.

**Claude Code:**

```
claude plugin marketplace add castrowithc/callbell
claude plugin install callbell@callbell
```

**Codex:**

```
codex plugin marketplace add castrowithc/callbell
codex plugin add callbell@callbell
```

On Codex, one step follows: **type `/hooks` and trust the callbell hook.** Codex treats hooks that ship
inside a plugin as non-managed and skips them until you have seen and approved the definition, so until you
do, the skills work but you get no norms, no project context, and no lens. Trust is tied to the hook's
registration, not its script, so you approve it once at first install and updates keep it.

If you registered the hook by hand in `~/.codex/hooks.json` under an earlier version, remove that entry now
or the context arrives twice.

## What you can install

- **`callbell`** — the always-on core: the norms, the session hook, and `/callbell:start` as the way in.
  Nothing else is required to use it. It carries no purpose of its own — what kind of work gets done is
  what the packs below decide.
- **`callbell-dev`** — a code pack: a lazy senior developer at three levels (`lite`, `full`, `ultra`) who
  asks whether a thing needs to exist before building it, reaches for the standard library and the platform
  before writing custom code, and leaves one runnable check behind. A second skill reviews for
  over-engineering, across a diff or a whole repo. Install with
  `claude plugin install callbell-dev@callbell` or `codex plugin add callbell-dev@callbell`.
- **`callbell-sysadmin`** — a server-manager pack: a passive safety layer that asks for explanation and
  confirmation before destructive commands, plus skills to set up, harden, back up, deploy to, and check a
  Linux host. **Before you install it:** it is for working *on a server* — you need shell access to that
  host and root or sudo on it, and some skills assume Docker where your stack uses it. It stays completely
  silent until a host identity is declared (`__callbell__/.host-identity`), so installing it device-wide
  costs your code repos nothing. Install with `claude plugin install callbell-sysadmin@callbell` or
  `codex plugin add callbell-sysadmin@callbell`, then run **`/callbell-sysadmin:start`** in the folder you
  administer from: it lays out a folder per host, reads that machine's inventory itself, and writes the
  identity.

## Usage

1. **Install** as above.
2. Run **`/callbell:start`** in the folder you want to work in. It checks what is there — Node, git, the
   scaffold, your ruleset — and **creates the missing scaffold right away and reports it**; for git, the
   ruleset, and purpose it asks, because those are decisions, not just files. Run it whenever you start
   somewhere new; on a folder that is already set up it costs you one line.
3. Work. The skills and norms are active immediately, in any folder.

**The most callbell will ever ask of you: Node on your PATH.** The session hook that supplies the norms and
project context runs on Node, so `node` has to be on your PATH (Nix/nvm users: on the *non-interactive*
shell's PATH). Without it nothing breaks loudly — no errors, no failed prompts — but you lose everything the
hook delivers: the always-on norms, the project context, and the memory and backlog indexes. The skills
themselves still load and run, but they run without the norms that are supposed to shape them. Treat it as
a degraded mode, not a supported one.

## Interaction language

This is your setup, on a level with Node and git, and callbell does not take it off your hands. callbell's
skills and norms are written in a language of their own. Without a fixed anchor an agent drifts into that
language over time, whatever you speak. Anchor your own and it stays with you, whatever language the shipped
skills are in.

Within a session callbell follows your language from your first message anyway. To make that hold across
sessions, pin one line in your **own** machine-local agent file (`~/.claude/CLAUDE.md` on Claude,
`~/.codex/AGENTS.md` on Codex), in your own words, for example:

> Always answer me in German (chat and visible reasoning).

That file is yours. callbell does not manage it and writes nothing into it. The one place callbell does take
a language is the entry point itself: call it with a language argument (`/callbell:start german`) and it runs
that single pass in that language, because unlike a typed message the call otherwise carries no language
signal. Nothing is stored.

## The `__callbell__` folder

The first `start` in a folder brings `__callbell__/` into being — and `start` creates it and tells you,
rather than asking: the scaffold is folders and files callbell manages, reversible and nothing to negotiate
over. It carries the work trail and the memory that travel with the project instead of living inside one
agent:

- `backlog/` — the versioned work trail: tasks and projects.
- `memory/` — what holds across sessions, as files in the repo.
- `templates/` — the templates tasks and projects are cut from.
- `zone-import/` and `zone-export/` — the two volatile buffers: raw material in, requested results out.

`plan`, `import`, `filing`, and the frontmatter standard all stand on it; without the folder they have no
ground. What `start` does *ask* about — git, ruleset, purpose and roles — are decisions it cannot announce.
The folder explains itself in its own `README.md` when you look inside.

## Namespaces

Each plugin is its own namespace, and that is what keeps names apart: the core's skills are called
`/callbell:start`, `/callbell:filing`, `/callbell:plan` and so on, a pack's are `/callbell-dev:review`,
`/callbell-sysadmin:harden`. The skill name never repeats the plugin name — the prefix already says it.

Your **own** skills live outside the plugins entirely and cannot collide with any of this.

## This repo

This repo **is** a marketplace: the always-on `callbell` collection plus optional purpose packs, each its
own installable plugin under `plugins/`. There is no build step and nothing is generated: every plugin is
authored here directly, and what you read is what gets installed.

- `plugins/callbell/` — the collection, what you install and run always-on:
  - `skills/` — one flat folder, seven skills: entry, filing, planning, import, commit, worktree, help.
  - `rules/core/` — norms that hold in any repo. The session tells the agent to read them straight away.
  - `rules/scaffold/` — norms that only mean anything where a `__callbell__/` scaffold exists (backlog,
    zones, frontmatter, memory, structure). Loaded only there — but then straight away, like the core
    norms; a repo without a scaffold pays nothing for them.
  - `hooks/callbell-context.js` — the SessionStart hook: reports the scaffold, injects the memory and
    backlog indexes, and points the agent at the rules. Claude runs it from the plugin; on Codex it has to
    be registered by hand (see Install).
- `.claude-plugin/marketplace.json` — the marketplace catalog, listing the collection and every pack.
- `node scripts/callbell-publish.js` — stamp the version, commit, push.

## License

MIT, see [LICENSE](LICENSE).
