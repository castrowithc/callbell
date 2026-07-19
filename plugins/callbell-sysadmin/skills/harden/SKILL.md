---
name: harden
description: >
  Harden a server to a security baseline, or audit an existing hardening: SSH, firewall, fail2ban, users,
  system. Trigger: "harden a server", "secure a server", "check the hardening", "security audit", a fresh
  VPS that needs locking down.
type: skill
edit: locked
---

# Harden a Server: Baseline and Procedure

Describes the **target state** (not just fixed commands), so the hardening works across distros. Document
any per-server deviation in that server's security context. For sign-off, walk `checklist.md` (in this skill
folder) point by point.

## Plan mode: decide first
- **Distro / init / package manager.** Determines the firewall tool (UFW / firewalld / nftables / a panel
  such as Plesk), the auto-update mechanism, and the timer system (systemd / cron / OpenRC).
- **SSH port:** change it or keep the default (record the deliberate choice).
- **Firewall tool** per server (see below).
- **Auto-reboot** yes or no (only non-critical servers, timed after the backup window).
- **fail2ban jails** depend on the web services running; `ignoreip` IPs are server-specific.

## SSH (target values)

| Setting | Target |
|---|---|
| PermitRootLogin | `no` |
| PasswordAuthentication | `no` |
| PubkeyAuthentication | `yes` |
| MaxAuthTries | `3` |
| LoginGraceTime | `30s` (default 120s; a shorter brute-force window) |
| ClientAliveInterval | `300` |
| ClientAliveCountMax | `3` |
| X11Forwarding | `no` (servers are typically headless) |
| AllowUsers | only the users actually needed (remove orphaned entries) |

Check the syntax (`sshd -t`), then `systemctl reload ssh`/`sshd` (reload, not restart).

## Firewall
- **Server firewall active**, only the needed ports open. Tool per server:
  - Standard Debian/Ubuntu: **UFW** (`ufw status`).
  - Fedora/RHEL: **firewalld**; minimal: **nftables**.
  - Panel servers (e.g. Plesk): the panel's own firewall (do not manage UFW/iptables directly).
- **Provider / host firewall** as an additional outer barrier (e.g. Hetzner Cloud, IONOS).
- Standard ports: SSH (as configured), HTTP 80, HTTPS 443.
- **Docker servers:** UFW cannot control Docker (Docker manipulates iptables directly). Bind ports to
  `127.0.0.1` and use the provider firewall as the outer barrier.
- Document the concrete tool and ports per server in that server's network context.

## fail2ban

| Jail | Required | bantime | findtime | maxretry | Note |
|---|---|---|---|---|---|
| sshd | yes | >= 1h | default | 3 | SSH brute force |
| recidive | yes | **permanent (`-1`)** | **1 week** | 3 | repeat offenders, all ports (iptables-allports) |
| service-specific | if a web service runs | >= 1h | | 3 | e.g. `caddy-auth` (Docker), panel jails |

**Persisting permanent bans:** in `/etc/fail2ban/fail2ban.local`, this is mandatory:
```
[DEFAULT]
dbpurgeage = 365d
```
The default `1d` purges DB entries after 24h, so permanent bans (`bantime = -1`) do **not** survive a
restart. With `365d` they stay persistent for a year.

**Escalation:** 3 failed SSH attempts, sshd jail (locked out); banned 3 times in 1 week, recidive, permanent
on all ports; bans survive restarts via `fail2ban.sqlite3`.

**Whitelist (`ignoreip`)** at minimum: `127.0.0.0/8`, `::1`, the **server's own public IP** (protection
against locking yourself out), optionally trusted source IPs. Document the concrete IPs in the server's
security context.

> On non-iptables distros (nftables/firewalld) pick the matching fail2ban `banaction`
> (`nftables-allports` instead of `iptables-allports`).

## Users
- No direct root login (neither SSH nor password-less sudo for critical ops).
- A separate admin user (never `root` as the working user).
- A monitoring user for external tools (no sudo).

## System
- **Automatic security updates** (security only, no feature updates). Debian/Ubuntu:
  `unattended-upgrades`; Fedora/RHEL: `dnf-automatic` (security); otherwise the distro equivalent.
- **Auto-reboot:** default no (manual after review). Opt-in for non-critical servers (dev/agents) with a
  reboot time **after** the backup window (e.g. backup 03:00, reboot 04:00). Production and customer
  servers stay manual. Record the choice per server.
- **Timezone:** set the operator's timezone, NTP active. VPS default is often `Etc/UTC`; change it with
  `sudo timedatectl set-timezone <Area/City>`.
  Watch out: **systemd timers** with `OnCalendar=HH:MM:SS` (no TZ suffix) run in the system timezone, so
  after a change the run time shifts. Follow up healthcheck and monitoring expectations (e.g. an
  uptime-monitor heartbeat).
- **Log rotation** configured.

## Docker (Docker servers only)
- Docker log rotation configured.
- Stack layout and conventions: skill `callbell-sysadmin:deploy`.
