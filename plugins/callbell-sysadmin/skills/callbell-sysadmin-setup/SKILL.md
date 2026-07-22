---
name: callbell-sysadmin-setup
description: >
  Provisions a fresh machine: decisions up front, then admin user, tools, hardening, backup, and optionally
  Docker in the right order. Not the way into the pack, that's /callbell-sysadmin-start. Start it by typing
  /callbell-sysadmin-setup.
type: skill
edit: locked
disable-model-invocation: true
---

# Provisioning a fresh machine: the sequence

Run the **full initial provisioning** of a server here. This isn't the way into the pack; `/callbell-sysadmin-start` is, and it runs on servers that have been up for ages too. This is about a machine that has nothing yet.

It's the sequencer; the individual steps live in this folder's companion files and in the standalone skills `callbell-sysadmin-harden`, `callbell-sysadmin-backup`, and `callbell-sysadmin-deploy` (load each when you need it, not ahead of time).

> Runs on the new server as the admin user, not as root. Before destructive steps the safety rules apply (two-connection pattern for SSH and firewall).

## Phase 0: gather decisions (in plan mode, BEFORE execution)

These parameters carry every later step. **Ask actively**, assume nothing. The common case is Ubuntu/Debian, but the server can be otherwise:

1. **Distribution, init system, package manager.** E.g. Ubuntu/Debian (`apt`, `systemd`, `ufw`),
   Fedora/RHEL (`dnf`, `systemd`, `firewalld`), Alpine (`apk`, OpenRC). Unclear: `cat /etc/os-release`,
   `ps -p1 -o comm=`. Sets the commands for packages, firewall, and timers.
2. **Server type and purpose.** Affects the firewall tool, automatic reboot, and whether Docker gets set up.
3. **Git authentication.** PAT (the common case), deploy key, or account SSH key (details: `git-auth.md`).
4. **Tools.** Confirm the default set (`micro`, `mc`, `fzf`, `tmux`, `git`).
5. **Docker server?** If so, `callbell-sysadmin-deploy` and the database dumps run at the end.

Hardening and backup decisions do **not** fall here: `callbell-sysadmin-harden` settles firewall, SSH port,
and automatic reboot, `callbell-sysadmin-backup` settles the backup parameters (target, time window,
notification), each in its own skill's plan mode. Record the decisions in this host's domain.

## Phase 1: working folder and host identity

**This skill doesn't do this itself.** Call `/callbell-sysadmin-start` and let it run: it checks the
scaffold, ships the templates, creates the domain `<host>/` with `framework.md` and `index.md`, reads the
machine's inventory, and sets `__callbell__/.host-identity`.

The reason for the split is the mistake that forced it: provisioning a machine and setting up a working
folder are two jobs, and while they were one, the domain never got created. It's needed even when no one
ever sets up a server from scratch.

From the next session on, the hook names this domain as the workspace and activates the passive safety layer.

## Phase 2: base

- **Admin user** with sudo (never work as root); install the SSH key.
- **Set up Git globally:** `user.name`, `user.email`, `init.defaultBranch main`, `pull.rebase false`.

## Phase 3: install tools

See the companion file `tools.md` (`micro`, `mc`, `fzf`, `tmux`, `git`, installation across distributions
plus `tmux.conf`).

## Phase 4: hardening

Load the skill `callbell-sysadmin-harden` and run it (SSH, firewall, fail2ban, users, system;
distribution-aware, with decision points). Record every deviation from the baseline in this host's domain,
with its reason.

## Phase 5: backup

Load the skill `callbell-sysadmin-backup` and run it (Borg/Borgmatic to a remote target, notification,
credentials, staggered start time, restore test).

## Phase 6: Docker (Docker servers only)

Load the skill `callbell-sysadmin-deploy` for the stack conventions; the database dumps hook in before the
backup through `callbell-sysadmin-backup` and its companion file `db-dumps.md`.

## Phase 7: sign-off

Walk the `callbell-sysadmin-harden` sign-off checklist point by point and record the result in this host's
domain. Verify the first backup and a restore test.
