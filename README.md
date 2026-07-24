# Callbell

**An expert surrounded by experts.** You are the expert; the agents and sub-agents are experts working for you. And the communication between them is **lazy**: the leanest solution that actually holds, rather than effort on spec. The name is the metaphor, a **call bell** (service bell): you ring, the experts come. That's why everything callbell ships carries the `callbell` prefix.

Callbell is **not** limited to coding. It's a framework for agentic solo work, for devs and non-devs alike.

## The always-on core

Callbell's core is **one plugin**, installed once per machine and active in every folder. It carries the skills, the norms, and a session hook that delivers the context. Install and work: nothing to copy, nothing to configure. Optional purpose packs install the same way from the same marketplace, only when you want them.

The core is deliberately purpose-neutral. It changes how you and the agent work together (conventions, frontmatter, zones, backlog, memory, data protection, git, and where a file belongs) and holds no opinion on *what* you work on. That opinion comes with a pack, and you install only the ones you want. A repo full of code and a repo full of markdown steering a topic get the same core; they differ in which pack stands beside it.

## Installation

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

Under Codex one extra step follows: **type `/hooks` and approve the callbell hook.** Codex treats hooks bundled in a plugin as unmanaged and skips them until you've seen and approved the definition. Until then the skills work, but there are no norms, no project context, and no lens. Approval hangs on the hook's registration, not its script, so you approve it once at first install and updates keep it.

If you registered the hook by hand under an earlier version in `~/.codex/hooks.json`, remove the entry now, or the context arrives twice.

## What you can install

- **`callbell`**: the always-on core: the norms, the session hook, and `/callbell-start` as the way in.
  That's all it takes. It carries no purpose of its own; which kind of work gets done is decided by the
  packs below.
- **`callbell-dev`**: a code pack: a lazy senior developer in three levels (`lite`, `full`, `ultra`) who
  first asks whether a thing needs to exist at all, reaches for the standard library and platform before
  writing custom code, and leaves a runnable check behind. A second skill checks for over-engineering, on a
  diff or a whole repo. Install with `claude plugin install callbell-dev@callbell` or
  `codex plugin add callbell-dev@callbell`.
- **`callbell-sysadmin`**: a server-manager pack: a passive safety layer that demands explanation and
  confirmation before destructive commands, plus skills to set up, harden, back up, deploy on, and check a
  Linux host. **Before installing:** it's for working *on a server*: you need shell access to that host and
  root or sudo on it, and some skills assume Docker where your stack uses it. It stays completely silent
  until a host identity is declared (`__callbell__/.host-identity`); installed machine-wide, it therefore
  costs your code repos nothing. Install with `claude plugin install callbell-sysadmin@callbell` or
  `codex plugin add callbell-sysadmin@callbell`, then **`/callbell-sysadmin-add-host`** in the folder you
  administer from: it creates a folder per host, reads the machine's own inventory, writes the identity, and
  offers to provision an unfinished machine.

## Usage

1. **Install** as above.
2. Run **`/callbell-start`** in the folder you want to work in. It checks what's there (Node, git, the
   scaffold, your ruleset) and **creates the missing scaffold right away and reports it**; about git,
   ruleset, and purpose it asks, those are decisions, not mere files. Call it whenever you start somewhere
   new; in a set-up folder it costs you one line.
3. Work. The skills and norms are active immediately, in every folder.

**The most callbell ever asks of you: Node in the PATH.** The session hook that delivers the norms and the project context runs on Node, so `node` must be in the PATH (Nix/nvm: in the *non-interactive* shell's PATH). If it's missing, nothing breaks loudly (no errors, no aborted prompts), but everything the hook delivers falls away: the always-on norms, the project context, and the memory and backlog indices. The skills themselves still load and run, but without the norms meant to shape them. A fallback, not a supported state.

## Interaction language

This is your setup, on a level with Node and git, and callbell doesn't do it for you. Callbell's skills and norms are written in one language. Without a fixed anchor, an agent drifts into that language over time, whatever you speak. Anchor your own, and it stays with you, whatever language the shipped skills are in.

Within a session, callbell follows your language anyway, from the first message. To make that hold across sessions, you set one line in your **own** machine-local agent file (`~/.claude/CLAUDE.md` on Claude, `~/.codex/AGENTS.md` on Codex), in your own words, for example:

> Always respond to me in English (chat and visible reasoning).

This file is yours. Callbell doesn't manage it and writes nothing into it. The one place callbell does take a language is the way in itself: call it with a language argument (`/callbell-start english`) and it runs that one pass in that language, because unlike a typed message the call otherwise carries no language signal. Nothing is saved in doing so.

## The `__callbell__` folder

On the first `start` in a folder, `__callbell__/` comes into being, and `start` creates it and tells you rather than asking: the scaffold is folders and files callbell manages, reversible and nothing to negotiate over. It carries the work trail and the memory that travel with the project rather than living in a single agent:

- `backlog/`: the versioned work trail: tasks and projects.
- `memory/`: what holds across sessions, as files in the repo.
- `templates/`: the templates that tasks and projects grow from.
- `zone-import/` and `zone-export/`: the two transient buffers: raw material in, requested deliverables out.

On this stand `plan`, `import`, `filing`, and the frontmatter standard; without the folder they have no ground. What `start` does *ask* about (git, ruleset, purpose, and roles) are decisions it can't announce. The folder explains itself in its own `README.md` when you look inside.

## Namespaces

Each plugin is its own namespace, and each skill carries its plugin name as a prefix: the core's skills are `/callbell-start`, `/callbell-filing`, `/callbell-plan`, and so on, a pack's `/callbell-dev-review`, `/callbell-sysadmin-harden`. The prefix is there on purpose, not redundant: type `/callbell` and you find all the core's skills at once, `/callbell-sysadmin` all the server pack's.

Your **own** skills sit entirely outside the plugins and can't collide with any of this.

## This repo

This repo **is** a marketplace: the always-on collection `callbell` plus optional purpose packs, each its own installable plugin under `plugins/`. There's no build step and nothing is generated: each plugin is written here directly, and what you read is what gets installed.

- `plugins/callbell/`: the collection, what you install and runs always-on:
  - `skills/`: a flat folder, ten skills: the way in, filing, planning, huddling, import, commit, worktree, adhd, the Claude statusline, help.
  - `rules/core/`: norms that apply in every repo. The session tells the agent to read them right away.
  - `rules/scaffold/`: norms that mean something only where a `__callbell__/` scaffold exists (backlog,
    zones, frontmatter, memory, structure). Loaded only there, but then right away, like the core norms; a
    repo without a scaffold pays nothing.
  - `hooks/callbell-context.js`: the SessionStart hook: reports the scaffold, injects the memory and backlog
    indices, and points the agent at the rules. Claude runs it from the plugin; under Codex it must be
    registered by hand (see Installation).
- `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`: the two marketplace catalogues (Claude and Codex) that list the collection and each pack; kept in sync by hand.
- `node scripts/callbell-publish.js`: stamp the version, commit, push.

## License

MIT, see [LICENSE](LICENSE).
