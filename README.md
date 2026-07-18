# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**One expert, surrounded by experts.** You are the expert; the agents and subagents are experts who work
for you. And the communication between them is **lazy**: the leanest solution that actually holds, not
effort on spec. The name is the metaphor, a **call bell** (the service bell on a counter): you ring, the
experts come. That is why everything callbell ships carries the `callbell` prefix.

Callbell is **not** limited to coding. It is a frame for agentic solo work, for devs and non-devs alike.

## One plugin

Callbell is a **plugin**, installed once per device and active in every folder. It carries the skills, the
norms, and a session hook that supplies the context. There is nothing to copy and nothing to choose.

The plugin serves both kinds of work from one install. A session hook resolves the **lens** at runtime:
whether a repo is primarily executable code or primarily markdown steering a topic. The lazy skill family
reads that lens and adapts. Code projects get the code flavor, operational work (personal OS, business OS,
wiki and docs) gets the ops flavor plus the filing system, and the backbone underneath is shared:
conventions, frontmatter, zones, backlog, memory, data protection, Git.

## Usage

1. **Install** the plugin from the marketplace.
2. Work. The skills and norms are active immediately, in any folder.
3. Optionally run `/callbell-onboarding`: the agent walks you through the setup and lays down a persistent
   project scaffold (context, memory, backlog, zones). Laying down a scaffold is a deliberate act, so it is
   never automatic.

**The most callbell will ever ask of you: Node on your PATH.** The session hook that supplies the norms and
project context runs on Node, so `node` has to be on your PATH (Nix/nvm users: on the *non-interactive*
shell's PATH). Without it nothing breaks loudly — the skills still work; the always-on norms and context
just stay quiet instead of erroring on every prompt.

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
    injects context and rules. Runs on Claude and Codex alike.
- `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json` — the marketplace catalogs, one
  per host, listing the collection and any packs.
- `node scripts/callbell-publish.js` — stamp the version, commit, push.

## License

MIT, see [LICENSE](LICENSE).
