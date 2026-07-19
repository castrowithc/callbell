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

On Codex, one manual step follows, because Codex does not yet run hooks that ship inside a plugin
([openai/codex#16430](https://github.com/openai/codex/issues/16430); the `plugin_hooks` feature is absent as
of 0.134.0). The skills install and work, but the session hook never fires, so you get no norms, no project
context, and no lens. Register it yourself in `~/.codex/hooks.json`, replacing both paths with the install
root that `codex plugin add` printed:

```json
{ "hooks": { "SessionStart": [ { "matcher": "startup|resume",
  "hooks": [ { "type": "command",
    "command": "PLUGIN_ROOT=<install-root> node <install-root>/hooks/callbell-context.js --rules",
    "timeout": 5 } ] } ] } }
```

Codex asks you to trust a newly added hook before it runs. If a later Codex version starts running plugin
hooks by itself, you will see the context twice — remove this entry then.

## What you can install

- **`callbell`** — the always-on core: the norms, the session hook, and `/callbell:start` as the way in.
  Nothing else is required to use it. It carries no purpose of its own — what kind of work gets done is
  what the packs below decide.
- **`callbell-dev`** — a code pack: a lazy senior developer at three levels (`lite`, `full`, `ultra`) who
  asks whether a thing needs to exist before building it, reaches for the standard library and the platform
  before writing custom code, and leaves one runnable check behind. Four more skills review a diff, audit a
  repo, harvest the shortcuts you deferred, and show the measured impact. Install with
  `claude plugin install callbell-dev@callbell` or `codex plugin add callbell-dev@callbell`.
- **`callbell-sysadmin`** — a server-manager pack: a passive safety layer that asks for explanation and
  confirmation before destructive commands, plus skills to set up, harden, back up, deploy to, and check a
  Linux host. **Before you install it:** it is for working *on a server* — you need shell access to that
  host and root or sudo on it, and some skills assume Docker where your stack uses it. It stays completely
  silent until you declare a host identity (`__callbell__/.host-identity`), so installing it device-wide
  costs your code repos nothing. Install with `claude plugin install callbell-sysadmin@callbell` or
  `codex plugin add callbell-sysadmin@callbell`.

## Usage

1. **Install** as above.
2. Run **`/callbell:start`** in the folder you want to work in. It checks what is there — Node, git, the
   scaffold, your ruleset — reports only what is missing, and offers to lay it down. Nothing is written
   until you say so. Run it whenever you start somewhere new; on a folder that is already set up it
   costs you one line.
3. Work. The skills and norms are active immediately, in any folder.

**The most callbell will ever ask of you: Node on your PATH.** The session hook that supplies the norms and
project context runs on Node, so `node` has to be on your PATH (Nix/nvm users: on the *non-interactive*
shell's PATH). Without it nothing breaks loudly — no errors, no failed prompts — but you lose everything the
hook delivers: the always-on norms, the project context, and the memory and backlog indexes. The skills
themselves still load and run, but they run without the norms that are supposed to shape them. Treat it as
a degraded mode, not a supported one.

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
    zones, frontmatter, memory, structure). Named only there, and read on arrival in their area, so a repo
    without a scaffold pays nothing for them.
  - `hooks/callbell-context.js` — the SessionStart hook: reports the scaffold, injects the memory and
    backlog indexes, and points the agent at the rules. Claude runs it from the plugin; on Codex it has to
    be registered by hand (see Install).
- `.claude-plugin/marketplace.json` — the marketplace catalog, listing the collection and every pack.
- `node scripts/callbell-publish.js` — stamp the version, commit, push.

## License

MIT, see [LICENSE](LICENSE).
