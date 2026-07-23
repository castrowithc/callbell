---
description: >
  Companion to callbell-sysadmin-add-host: install the standard command-line tools (micro, mc, fzf, tmux, git)
  across distributions and load the tmux configuration.
type: playbook
edit: locked
---

# Installing tools

A standard set for a server. Pick the package manager per distribution (settled in plan mode); the package names are largely the same.

| Tool | For |
|---|---|
| `micro` | terminal editor (friendlier than nano or vim) |
| `mc` (Midnight Commander) | two-pane file manager |
| `fzf` | fuzzy search (history, files, `Ctrl+R`) |
| `tmux` | terminal multiplexer (sessions that persist) |
| `git` | version control (usually preinstalled) |

## Installation per distribution

```bash
# Debian/Ubuntu (the common case)
sudo apt update && sudo apt install -y micro mc fzf tmux git

# Fedora/RHEL
sudo dnf install -y micro mc fzf tmux git

# Alpine
sudo apk add micro mc fzf tmux git

# Arch
sudo pacman -S --needed micro mc fzf tmux git
```

> `micro` isn't in every repo (e.g. older Debian releases). Fall back to the official install script, **but
> only after you've looked at it** (no blind `curl | bash`, see the safety rule): inspect the source
> `https://getmic.ro`, or grab the binary from the official GitHub releases page.

Check versions:

```bash
for t in micro mc fzf tmux git; do printf '%-6s ' "$t"; command -v "$t" >/dev/null && "$t" --version 2>/dev/null | head -1 || echo "MISSING"; done
```

## Load the tmux configuration

A base configuration is in `templates/tmux.conf` in this skill folder. Copy it to `~/.tmux.conf` and reload it in tmux with `Ctrl+B`, then `r`. Plugins (TPM) are commented out in the template and optional.

## Wire fzf into the shell (optional)

```bash
# Debian/Ubuntu (the package ships example key bindings):
echo 'source /usr/share/doc/fzf/examples/key-bindings.bash' >> ~/.bashrc
# otherwise: $(fzf --bash), or wire in your distribution's key bindings
```
