---
name: setup
description: >
  Bring a new server up from scratch: lay the callbell scaffold and write its host identity, then tools,
  hardening, backup, and optionally Docker. Trigger: "set up a new server", "onboard a server", "provision
  a fresh VPS".
type: skill
edit: locked
---

# Set Up a New Server: Orchestrator

This skill runs the **full first-time provisioning** of a server. It is the entry point; the detail steps
live in this folder's resource files and in the standalone skills `callbell-sysadmin:harden`,
`callbell-sysadmin:backup`, and `callbell-sysadmin:deploy` (load each on demand, progressive disclosure).

> Run on the new server as the admin user (not root). Before destructive steps the safety rules apply (the
> two-connection pattern for SSH and firewall).

## Phase 0: collect decisions (in plan mode, BEFORE execution)
These parameters drive every later step. **Ask actively**, do not assume. The default is Ubuntu/Debian, but
the server may differ:
1. **Distro + init system + package manager.** For example Ubuntu/Debian (`apt`, `systemd`, `ufw`),
   Fedora/RHEL (`dnf`, `systemd`, `firewalld`), Alpine (`apk`, OpenRC). If unclear: `cat /etc/os-release`,
   `ps -p1 -o comm=`. Determines the package, firewall, and timer commands.
2. **Server type / purpose.** Influences the firewall tool, auto-reboot, and whether Docker is set up.
3. **Git auth mechanism.** PAT (default), deploy key, or account SSH key (details: `git-auth.md`).
4. **Tools.** Confirm the standard set (`micro`, `mc`, `fzf`, `tmux`, `git`).
5. **Docker server?** If yes, `callbell-sysadmin:deploy` and DB dumps run at the end.

Hardening and backup decisions are **not** made here: the firewall, SSH port, and auto-reboot are settled by
`callbell-sysadmin:harden`; the backup parameters (storage target, time window, notify channel) by
`callbell-sysadmin:backup`, each in that skill's plan mode. Record the decisions in this server's context.

## Phase 1: scaffold and host identity
callbell already lays the persistent per-server structure, so this replaces the hand-built bootstrap:
1. **Lay the scaffold.** Run `/callbell:start` in this server's working folder. It lays the
   `__callbell__/` scaffold (memory, backlog, zones) that holds everything this server knows.
2. **Write the host identity.** Record the bare host name so the pack can scope work to it:
   ```bash
   echo "<host>" > __callbell__/.host-identity   # the working folder's name
   ```
   From the next session start, `callbell-sysadmin` reads it, states the working domain (`<host>/` and
   `__callbell__/`, everything else taboo), and activates the passive safety layer.
3. **Capture the server's facts** in the scaffold's context: hostname, OS, provider, public IP, SSH port,
   admin user, CPU/RAM/disk, plus security, network, service, and backup specifics as they are set. These
   per-server facts live in `__callbell__/`, **never** in the plugin or anywhere versioned publicly.

## Phase 2: base
- **Admin user** with sudo (never work as root); deposit the SSH key.
- **Configure git globally:** `user.name`, `user.email`, `init.defaultBranch main`, `pull.rebase false`.

## Phase 3: install tools
See the resource `tools.md` (`micro`, `mc`, `fzf`, `tmux`, `git`, multi-distro install plus `tmux.conf`).

## Phase 4: hardening
Load the skill `callbell-sysadmin:harden` and run it (SSH, firewall, fail2ban, users, system; distro-aware,
with decision points). Document any deviation from the baseline in this server's security context.

## Phase 5: backup
Load the skill `callbell-sysadmin:backup` and run it (Borg/Borgmatic to an off-site target, notify,
credentials, staggered start time, restore test).

## Phase 6: Docker (Docker servers only)
Load the skill `callbell-sysadmin:deploy` for stack conventions; wire DB dumps before the backup via
`callbell-sysadmin:backup` and its `db-dumps.md` resource.

## Phase 7: sign-off
Walk the sign-off checklist of `callbell-sysadmin:harden` point by point; record the result in this server's
security context. Verify the first backup and a restore test.
