---
name: shortcuts
description: >
  Set up or align the standard shell shortcuts on a server: repo navigation (repos, plus one alias per
  project) and tmux (tmux-n/-a/-k/-l). Trigger: "set up aliases", "add tmux shortcuts", "shell shortcuts
  on a new server".
type: skill
edit: locked
---

# Set up Shell Shortcuts

Installs an **idempotent, managed block** with the standard shortcuts into the login shell. The block is
bundled in `shortcuts.sh` (this skill folder) and framed between the markers
`# >>> callbell shell shortcuts >>>` / `# <<< callbell shell shortcuts <<<`, so it can be found again,
replaced, or removed cleanly without touching the rest of the shell config.

## Contents

| Shortcut | Type | Effect |
|---|---|---|
| `repos` | Alias | `cd ~/repos` |
| per-project (e.g. `myproject`) | Alias | `cd` into a repo you open often |
| `tmux-n <name>` | Function | new tmux session |
| `tmux-a <name>` | Function | attach to a session |
| `tmux-k <name>` | Function | end a session |
| `tmux-l` | Alias | list sessions |

**Why functions vs. alias:** `tmux-n/-a/-k` need an argument (the session name) at a fixed position, which
only a function (`$1`) can do, not an alias. `tmux-l` needs none, so an alias is enough.

## Procedure

1. **Choose the target file.** Default: `~/.bash_aliases` (sourced automatically by the default bash
   `~/.bashrc`). If no auto-source exists, write into `~/.bashrc` directly instead, or add
   `[ -f ~/.bash_aliases ] && . ~/.bash_aliases` to `~/.bashrc`.

2. **Check for an existing block.** Test for the markers:
   ```
   grep -q '>>> callbell shell shortcuts >>>' ~/.bash_aliases
   ```

3. **Install / update.**
   - No block present: append `shortcuts.sh` to the end of the file.
   - Block present: replace the region between the markers with the current `shortcuts.sh` content
     (remove the old block with `sed '/>>> callbell/,/<<< callbell/d'`, then append the new one).

4. **Remove old / stray aliases.** Clean up outdated single aliases outside the block, so nothing is
   defined twice or contradictorily (e.g. old tmux definitions directly in `~/.bashrc`, earlier
   navigation aliases).

5. **Verify.** New login shell, or `source` the target file, then
   `type repos tmux-n tmux-a tmux-k tmux-l`. Each must resolve.

> **Important, already-running shells:** a session started **before** the install/update does not know the
> new shortcuts yet (a running shell does not re-read the file automatically), so it reports
> `command not found`. Tell the user explicitly: in every open session, run `source ~/.bash_aliases`
> (or the target file) once, or open a new terminal.

## Adjusting

To add or change a shortcut across your servers: edit `shortcuts.sh` and reinstall the block on the
affected servers (step 3). That keeps the standard in **one** source.
