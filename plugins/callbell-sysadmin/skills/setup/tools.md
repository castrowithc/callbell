---
description: >
  Resource for callbell-sysadmin:setup: install the standard CLI tools (micro, mc, fzf, tmux, git)
  multi-distro and apply the tmux config.
type: playbook
edit: locked
---

# Install Tools

A standard tool set for a server. Pick the package manager per distro (settled in plan mode); the package
names are largely identical.

| Tool | Purpose |
|---|---|
| `micro` | terminal editor (more intuitive than nano/vim) |
| `mc` (Midnight Commander) | two-pane file manager |
| `fzf` | fuzzy finder (history, files, `Ctrl+R`) |
| `tmux` | terminal multiplexer (persistent sessions) |
| `git` | version control (usually preinstalled) |

## Install per distro
```bash
# Debian/Ubuntu (default)
sudo apt update && sudo apt install -y micro mc fzf tmux git

# Fedora/RHEL
sudo dnf install -y micro mc fzf tmux git

# Alpine
sudo apk add micro mc fzf tmux git

# Arch
sudo pacman -S --needed micro mc fzf tmux git
```

> `micro` is not in every repo (e.g. older Debian releases). Fall back to the official install script
> **only after inspecting it** (no blind `curl | bash`, per the safety rule): verify the `https://getmic.ro`
> source, or fetch the binary from the official GitHub releases page.

Verify versions:
```bash
for t in micro mc fzf tmux git; do printf '%-6s ' "$t"; command -v "$t" >/dev/null && "$t" --version 2>/dev/null | head -1 || echo "MISSING"; done
```

## Apply the tmux config
A base configuration ships in `templates/tmux.conf` (this skill folder). Copy it to `~/.tmux.conf` and
reload inside tmux with `Ctrl+B`, then `r`. Plugins (TPM) are commented out in the template and optional.

## fzf shell integration (optional)
```bash
# Debian/Ubuntu (the package ships example bindings):
echo 'source /usr/share/doc/fzf/examples/key-bindings.bash' >> ~/.bashrc
# otherwise: $(fzf --bash), or wire in the distro's own key bindings
```
