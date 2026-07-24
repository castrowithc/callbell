---
name: callbell-sysadmin-harden
description: >
  Hardens a server to a security baseline, or checks an existing hardening: SSH, firewall, fail2ban, users,
  system. Start it by naming callbell-sysadmin-harden.
disable-model-invocation: true
license: MIT
type: skill
edit: locked
---

# Hardening a server: baseline and procedure

Targets the **end state**, not just fixed commands, so the hardening carries across distributions. Record every deviation in this host's domain, with its reason. For sign-off, walk `checklist.md` in this skill folder point by point.

## Plan mode: decide first

- **Distribution, init, package manager.** Sets the firewall tool (UFW / firewalld / nftables / a panel
  like Plesk), the automatic-update mechanism, and the timer system (systemd / cron / OpenRC).
- **SSH port:** change it or leave it on the default (record the deliberate choice).
- **Firewall tool** per server (see below).
- **Automatic reboot** yes or no (uncritical servers only, timed after the backup window).
- **fail2ban jails** depend on the running web services; the `ignoreip` addresses are server-specific.

## SSH (target values)

| Setting | Target |
|---|---|
| PermitRootLogin | `no` |
| PasswordAuthentication | `no` |
| PubkeyAuthentication | `yes` |
| MaxAuthTries | `3` |
| LoginGraceTime | `30s` (default 120s; shorter window for brute force) |
| ClientAliveInterval | `300` |
| ClientAliveCountMax | `3` |
| X11Forwarding | `no` (servers usually run headless) |
| AllowUsers | only the users actually needed (remove stale entries) |

Check syntax (`sshd -t`), then `systemctl reload ssh`/`sshd` (reload, not restart).

## Firewall

- **Server firewall active**, only the needed ports open. Tool per server:
  - Debian/Ubuntu default: **UFW** (`ufw status`).
  - Fedora/RHEL: **firewalld**; minimal: **nftables**.
  - Panel servers (e.g. Plesk): the panel's firewall (don't manage UFW/iptables directly).
- **Provider or host firewall** as an extra outer barrier (e.g. Hetzner Cloud, IONOS).
- Default ports: SSH (as configured), HTTP 80, HTTPS 443.
- **Docker servers:** UFW can't control Docker (Docker writes iptables directly). Bind ports to
  `127.0.0.1` and use the provider firewall as the outer barrier.
- Record the tool and ports concretely in this host's domain.

## fail2ban

| Jail | Required | bantime | findtime | maxretry | Note |
|---|---|---|---|---|---|
| sshd | yes | >= 1h | default | 3 | SSH brute force |
| recidive | yes | **permanent (`-1`)** | **1 week** | 3 | repeat offenders, all ports (iptables-allports) |
| service-specific | if a web service runs | >= 1h | | 3 | e.g. `caddy-auth` (Docker), panel jails |

**Make permanent bans survive:** in `/etc/fail2ban/fail2ban.local` this is mandatory:

```
[DEFAULT]
dbpurgeage = 365d
```

The default `1d` clears entries from the database after 24 hours, so permanent bans (`bantime = -1`) do
**not** survive a restart. With `365d` they hold for a year.

**Escalation:** 3 failed SSH attempts, sshd jail (locked out); 3 bans in a week, recidive, permanent on all
ports; bans survive restarts via `fail2ban.sqlite3`.

**Whitelist (`ignoreip`)** at least: `127.0.0.0/8`, `::1`, the server's **own public IP** (so you don't
lock yourself out), optionally trusted source IPs. Record the concrete addresses in this host's domain.

> On distributions without iptables (nftables/firewalld) pick the matching `banaction` for fail2ban
> (`nftables-allports` instead of `iptables-allports`).

## Users

- No direct root login (neither by SSH nor passwordless sudo for critical operations).
- A dedicated admin user (never `root` as the working user).
- A monitoring user for external tools (without sudo).

## System

- **Automatic security updates** (security only, no feature updates). Debian/Ubuntu:
  `unattended-upgrades`; Fedora/RHEL: `dnf-automatic` (security); otherwise the distribution's counterpart.
- **Automatic reboot:** off by default (manual after review). Optional for uncritical servers
  (development, agents) with a reboot time **after** the backup window (e.g. backup 03:00, reboot 04:00).
  Production and customer servers stay manual. Record the choice per server.
- **Time zone:** set the operator's time zone, NTP active. The VPS default is often `Etc/UTC`; change it
  with `sudo timedatectl set-timezone <area/city>`.
  Careful: **systemd timers** with `OnCalendar=HH:MM:SS` (no time-zone suffix) run in the system's time
  zone, so a change shifts their run time. Follow through on healthcheck and monitoring expectations (e.g.
  an uptime monitor's heartbeat).
- **Log rotation** set up.

## Docker (Docker servers only)

- Log rotation for Docker set up.
- Stack layout and conventions: skill `callbell-sysadmin-deploy`.
