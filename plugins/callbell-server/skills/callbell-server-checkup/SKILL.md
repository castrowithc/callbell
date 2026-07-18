---
name: callbell-server-checkup
description: >
  Periodic all-round health check of one of your servers: system (kernel/reboot/disk/time/resources),
  pending updates, hardening drift, backup liveness, checked against the documented facts, result as a
  dated report. Trigger: "check the server", "is everything running smoothly", "all-round / health check",
  "check the status".
type: skill
edit: locked
---

# Server Checkup: Operational Sweep, Drift, Report

Periodic health check of an already set-up server. **Read-only operation** plus a report, it does **not**
change the system configuration. Findings are reported and fixed only on request.

**Boundary (not a duplicate):** The target values of the hardening (SSH, firewall, fail2ban, users) are
defined by `callbell-server-harden`; the backup setup is defined by `callbell-server-backup`. This skill
**checks** the running state against that baseline and against the per-server documented actual facts, it
does not redefine the baseline. For a deeper audit or re-hardening, load `callbell-server-harden`.

## Procedure

1. **Load the identity and target state.** Resolve this server's context (its `__callbell__/` scaffold) to
   the working folder. The per-server documented actual state (security, backup) is in context at session
   start anyway (server overlay + server context) and serves as the target reference for the comparison.
   The generic target standards for hardening/backups are defined by the skills `callbell-server-harden`
   and `callbell-server-backup`. A previous report in the server's report area serves as a format template.
2. **Run the sweep.** Run this skill folder's `checkup.sh` resource (read-only, gathers all metrics in one
   pass):
   ```bash
   sudo bash checkup.sh
   ```
   Distro/tool deviations are caught in the script (`command -v` guards); on non-systemd or non-UFW
   servers, fill in the missing blocks manually with the distro equivalent (firewalld/nftables, Plesk
   firewall, cron instead of timers).
3. **Compare against the target state (drift).** Compare each block with the per-server documented
   security/backup state and the generic standard (`callbell-server-harden`/`callbell-server-backup`). Any
   deviation = a finding. Typical drift: an SSH value changed, a jail inactive, a timer disabled, an
   archive older than one interval, a disk threshold, running kernel != newest installed without a reboot
   plan.
4. **Assess.** Per finding, a severity plus whether action is needed. Security updates from the
   unattended-upgrades allowlist (`*-security`) are **not** a finding as long as u-u is active, they are
   installed automatically; just mention them.
5. **Write the report.** A new dated report file in the server's report area (`type: knowledge`,
   `edit: shared`). Schema below. **No secrets** in the report (webhook URLs/keys/IPs used sparingly).
6. **Handle findings.** Fix only on explicit approval. The actual-facts files and the server overlay are
   `edit: locked`; after a fix, update the affected actual-facts file or the server's check history only
   **on instruction**.

## What is checked

| Area | Metrics |
|---|---|
| System | Uptime; running vs. newest installed kernel; `reboot-required` flag; timezone + NTP sync; disk usage of `/` |
| Resources | RAM/swap usage; top CPU/RAM processes |
| Services | Running services, compared against the documented `services` facts (unexpected/missing = a finding) |
| Updates | Total pending; of which `*-security`; `held` packages; last u-u run |
| SSH | Effective values via `sshd -T` (RootLogin, PasswordAuth, MaxAuthTries, LoginGraceTime, ClientAlive*, X11, AllowUsers, Port) |
| Firewall | UFW status + open ports (or firewalld/nftables) |
| fail2ban | Active jails; `dbpurgeage`; currently/total banned per jail |
| Users | UID-0 accounts != root; sudo/wheel members |
| Logins | Recent logins; failed SSH logins + top source IPs |
| System updates | `unattended-upgrades` active; auto-reboot time |
| Backup | `borgmatic.timer` active + next run; last run result; newest archive + gap check |

`/etc/shadow` is deliberately **not** read (safety rule); an empty-password audit only on explicit request.
Deeper forensics (recursive file-change scan, cron audit) is not part of the sweep; on suspicion, check
manually and specifically.

## Report Schema

```markdown
---
description: >
  Server checkup report YYYY-MM-DD: all-round health check, result snapshot.
type: knowledge
edit: shared
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Server Checkup: YYYY-MM-DD

## Summary
<1-3 sentences: overall picture, number of findings, drift yes/no.>

## System
### [OK|INFO|FINDING|FIXED] <title>
- <finding with number/evidence>

## Hardening
...

## Backup
...

## Open Items
- [ ] <what remains, with date/condition>, or "None."
```

Markers: `[OK]` conform · `[INFO]` worth mentioning, no action needed · `[FINDING]` deviation still open ·
`[FIXED]` corrected in this session.
