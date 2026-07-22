---
description: >
  Begleitdatei zu callbell-sysadmin-setup: die Standard-Kommandozeilenwerkzeuge (micro, mc, fzf, tmux,
  git) über mehrere Distributionen hinweg installieren und die tmux-Konfiguration einspielen.
type: playbook
edit: locked
---

# Werkzeuge installieren

Ein Standardsatz für einen Server. Den Paketmanager je Distribution wählen (im Planmodus geklärt); die
Paketnamen sind weitgehend gleich.

| Werkzeug | Wozu |
|---|---|
| `micro` | Editor im Terminal (eingängiger als nano oder vim) |
| `mc` (Midnight Commander) | Dateimanager mit zwei Fenstern |
| `fzf` | unscharfe Suche (Verlauf, Dateien, `Strg+R`) |
| `tmux` | Terminal-Multiplexer (Sitzungen, die bestehen bleiben) |
| `git` | Versionsverwaltung (meist vorinstalliert) |

## Installation je Distribution

```bash
# Debian/Ubuntu (Normalfall)
sudo apt update && sudo apt install -y micro mc fzf tmux git

# Fedora/RHEL
sudo dnf install -y micro mc fzf tmux git

# Alpine
sudo apk add micro mc fzf tmux git

# Arch
sudo pacman -S --needed micro mc fzf tmux git
```

> `micro` liegt nicht in jedem Repo (etwa in älteren Debian-Ständen). Weich auf das offizielle
> Installationsskript aus, **aber erst nachdem du es angesehen hast** (kein blindes `curl | bash`, siehe
> Sicherheitsregel): die Quelle `https://getmic.ro` prüfen, oder das Binary von der offiziellen
> GitHub-Releases-Seite holen.

Versionen prüfen:

```bash
for t in micro mc fzf tmux git; do printf '%-6s ' "$t"; command -v "$t" >/dev/null && "$t" --version 2>/dev/null | head -1 || echo "FEHLT"; done
```

## tmux-Konfiguration einspielen

Eine Grundkonfiguration liegt in `templates/tmux.conf` in diesem Skill-Ordner. Kopier sie nach
`~/.tmux.conf` und lad sie in tmux mit `Strg+B`, dann `r` neu. Plugins (TPM) sind in der Vorlage
auskommentiert und optional.

## fzf in der Shell einbinden (optional)

```bash
# Debian/Ubuntu (das Paket bringt Beispiel-Tastenbelegungen mit):
echo 'source /usr/share/doc/fzf/examples/key-bindings.bash' >> ~/.bashrc
# sonst: $(fzf --bash), oder die Tastenbelegung der eigenen Distribution einbinden
```
