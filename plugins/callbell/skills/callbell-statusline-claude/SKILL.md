---
name: callbell-statusline-claude
description: >
  Set up the Claude Code statusline: a configurable bar with toggleable widgets — model, reasoning effort,
  directory, git branch and diff, token usage, cost, rate-limit usage bars and resets. Start it by typing
  /callbell-statusline-claude; pass "disable X" or "enable Y" to toggle widgets.
disable-model-invocation: true
argument-hint: "[enable/disable widgets]"
license: MIT
type: skill
edit: locked
---

# callbell-statusline-claude

Configure the bar at the bottom of Claude Code: model, thinking effort, directory, git branch and diff,
token usage, cost, rate-limit usage and resets. Which widgets show is chosen in `~/.callbell/statusline.json`; the
render script is delivered payload the user never edits.

## When
- On the user's direct request. Slash-only: pointing the host statusline at a script is never something to
  auto-fire.
- This configures **Claude Code's** statusline specifically — hence the `-claude` name.

## Set up
`<plugin-root>` below is the folder this skill loaded from: the session context names it as `CALLBELL PLUGIN
ROOT`, otherwise it's two levels above this `SKILL.md`. Substitute that real absolute path before running;
never type `$CLAUDE_PLUGIN_ROOT` into a shell here (the host only substitutes it inside hook commands, so in
an ad-hoc shell it is empty and the call fails), and never hardcode a fixed path (it carries the version
number and is wrong after the next update).

1. Run the setup script. It copies the renderer to `~/.callbell/statusline.js` (a stable path that survives
   plugin updates, because the statusLine command runs without the plugin context), writes a default widget
   config if none exists, and points `~/.claude/settings.json` at it with a 60s refresh (needed so the
   reset countdowns tick between events):
   `node "<plugin-root>/scripts/callbell-statusline-setup.js"`
2. Tell the user it appears at the next interaction. It replaces any previous statusline.
3. **Ask whether the layout looks right.** If widgets are cut off or the dynamic wrapping misbehaves on
   their terminal, switch to the fixed layout: set `"layout": "fixed"` in `~/.callbell/statusline.json`.

## Widgets
Entries in the `widgets` array of `~/.callbell/statusline.json`. Drop an entry to hide it, reorder to reorder.

`model` · `thinking` (reasoning effort) · `dir` · `branch` · `diff` (git `+/-` and `pushed | commit needed |
push needed`) · `out` (last response tokens) · `context` (input bar, labelled `In:`) · `cost` · `session`
(5h usage bar, labelled `Session:`) · `reset` (5h window, labelled `Session Reset:`) · `weekly` (7d usage
bar, labelled `Weekly:`) · `weekly-reset` (7d window, labelled `Weekly Reset:`) · `method`
(`Subscription`/`API`).

- Git widgets (`branch`, `diff`) hide themselves outside a repo — so a plain folder or an Obsidian vault
  shows no git segment.
- `session`, `reset`, `weekly`, and `weekly-reset` need a Pro/Max subscription and hide on API usage;
  `method` shows which is in effect, so an empty rate-limit segment is legible.
- New widgets shipped in an update are not auto-inserted into an existing `widgets` array (that array is
  your explicit choice, dropping an entry hides it). Add `session` and `weekly` with `enable session,
  weekly` or by hand.

## Toggling from an argument
If the user passed one ("disable out, weekly-reset", "enable method", "put cost first"), edit the `widgets`
array in `~/.callbell/statusline.json` and confirm. No need to re-run setup — the renderer reads the config
on every render.

## Layout
- `wrap` (default): widgets flow left to right and reflow onto more lines when the window is too narrow.
  Nothing is dropped.
- `fixed`: four fixed rows — Model/Thinking/Dir · Branch/Diff · Out/In/Cost · Session/Session Reset/Weekly/
  Weekly Reset/Method — each showing only its active widgets. Use when wrap misbehaves.

## Separator
The `separator` field sets the dimmed string drawn between widgets. Default `" • "`. Set it to `" │ "`,
`" · "`, `" | "`, or `"  "` (two spaces, no visible divider) in `~/.callbell/statusline.json`, or ask the skill to
change it. Re-running setup after a plugin update copies the latest renderer and **tops up new config
fields** (like `separator`) into an existing config, without touching the user's widget choices.

## Colours (fixed in the renderer)
Usage bars (`context`, `session`, `weekly`): green · >35% yellow · >45% orange · >70% red. The context bar
is relative to the model's own window size, the rate-limit bars to each limit. Diff `+` green, `-` red-orange.
