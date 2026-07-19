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

The core serves both kinds of work from one install. A session hook resolves the **lens** at runtime:
whether a repo is primarily executable code or primarily markdown steering a topic. The lazy skill family
reads that lens and adapts. Code projects get the code flavor, operational work (personal OS, business OS,
wiki and docs) gets the ops flavor plus the filing system, and the backbone underneath is shared:
conventions, frontmatter, zones, backlog, memory, data protection, Git.

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
  Nothing else is required to use it.
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
hook delivers: the always-on norms, the project context, the memory and backlog indexes, and the lens. The
skills themselves still load and run; the lens-reading ones (`callbell`, `callbell-review`, `callbell-audit`,
`callbell-help`) fall back to working the lens out from the task at hand, which is less reliable than being
told. Treat it as a degraded mode, not a supported one.

## The `callbell` namespace

`callbell-*` is **reserved** for the skills and rules the plugin ships. The lazy flagship mode is simply
called `callbell` and flavors itself by the lens.

Put your **own** skills **outside** this prefix (your own name or your own prefix). That way plugin and
user skills stay distinguishable at all times, even when you mix them across projects.

## This repo

This repo **is** a marketplace: the always-on `callbell` collection plus optional purpose packs, each its
own installable plugin under `plugins/`. There is no build step and nothing is generated: every plugin is
authored here directly, and what you read is what gets installed.

- `plugins/callbell/` — the collection, what you install and run always-on:
  - `skills/` — one flat folder; the lens decides code vs ops at runtime, not the file layout.
  - `rules/core/` — norms that hold in any repo. Always injected.
  - `rules/scaffold/` — norms that only mean anything where a `__callbell__/` scaffold exists (backlog,
    zones, frontmatter, memory, structure). Injected only there, so a repo without one pays nothing for them.
  - `hooks/callbell-context.js` — the SessionStart hook: resolves the lens, reports the scaffold, and
    injects context and rules. Claude runs it from the plugin; on Codex it has to be registered by hand
    (see Install).
- `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json` — the marketplace catalogs, one
  per host, listing the collection and any packs.
- `node scripts/callbell-publish.js` — stamp the version, commit, push.

## License

MIT, see [LICENSE](LICENSE).
