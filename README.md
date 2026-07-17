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

## The `callbell` namespace

`callbell-*` is **reserved** for the skills and rules the plugin ships. Domain tools carry a segment:
`callbell-code-*` (code) and `callbell-ops-*` (ops). The lazy flagship mode is simply called `callbell` and
flavors itself by the lens.

Put your **own** skills **outside** this prefix (your own name or your own prefix). That way plugin and
user skills stay distinguishable at all times, even when you mix them across projects.

## This repo

This repo **is** the plugin. There is no build step and nothing is generated: `skills/`, `rules/`,
`hooks/`, and the host manifests are authored here directly, and what you read is what gets installed.

- `skills/` — one flat folder; the lens decides code vs ops at runtime, not the file layout.
- `rules/` — the norms, injected by the hook where the harness has no native reader.
- `hooks/callbell-context.js` — the SessionStart hook: resolves the lens and injects context and rules.
  Runs on Claude and Codex alike.
- `node scripts/callbell-publish.js` — stamp the version, commit, push.

## License

MIT, see [LICENSE](LICENSE).
