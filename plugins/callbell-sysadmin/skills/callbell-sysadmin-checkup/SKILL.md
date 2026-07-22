---
name: callbell-sysadmin-checkup
description: >
  Regular all-round check of a server: system (kernel, reboot, disk, time, resources), pending updates,
  drift from the hardening, backup liveness, compared with what's recorded about the host, as a dated
  report. For the routine "is everything still running well". Start it by typing /callbell-sysadmin-checkup.
type: skill
edit: locked
disable-model-invocation: true
---

# Server checkup: sweep, drift, report

Regular check of an already set-up server. **Read-only** plus a report; the system configuration is **not** changed. Report findings, and fix them only on request.

**Boundary, so nothing sits here twice:** `callbell-sysadmin-harden` sets the hardening target values (SSH, firewall, fail2ban, users), `callbell-sysadmin-backup` the backup layout. This skill **checks** the running state against that baseline and against what's recorded about the host; it doesn't redefine the baseline. For a deeper check or re-hardening, load `callbell-sysadmin-harden`. On a host you suspect someone reached, `callbell-sysadmin-incident` asks exactly that question.

## Procedure

1. **Load identity and target state.** The domain named at session start (folder `<host>/`) records what's
   known about this server: `framework.md`, how it's run, `index.md`, what's on it, along with the hardening
   and backup entries. That's the comparison basis for the sweep. The general target standards for hardening
   and backup live in the skills `callbell-sysadmin-harden` and `callbell-sysadmin-backup`. An earlier
   report in the domain serves as the format template.
2. **Run the sweep.** Run this skill folder's companion file `checkup.sh` (read-only, gathers every metric
   in one pass):
   ```bash
   sudo bash checkup.sh
   ```
   The script guards against distribution and tool differences (`command -v` guards); on servers without
   systemd or UFW, fill the missing blocks by hand with the distribution's counterpart (firewalld/nftables,
   Plesk firewall, cron instead of timer).
3. **Compare against the target state (drift).** Compare each block with what's recorded about this
   server's security and backup, and with the general standard
   (`callbell-sysadmin-harden`/`callbell-sysadmin-backup`). Every deviation is a finding. Typical: a changed
   SSH value, an inactive jail, a disabled timer, an archive older than one interval, a disk-usage
   threshold, running kernel unequal to the newest installed with no reboot plan, a restore proof that never
   got past level 1 or hasn't been renewed in a quarter.
4. **Assess.** Per finding, a severity and whether action is needed. Security updates from the
   unattended-upgrades allowlist (`*-security`) are **not** a finding as long as u-u is active, they get
   applied automatically; just mention them.
5. **Write the report.** A new, dated report file in this host's domain (`type: knowledge`,
   `edit: shared`). Layout below. **No secrets** in the report (webhook addresses, keys, and IPs sparingly).
6. **Handle findings.** Fix only after explicit approval. The host's recorded facts and framework are
   `edit: locked`; after a fix, update the affected file or the host's check history only **on instruction**.

## What gets checked

| Area | Metrics |
|---|---|
| System | uptime; running vs newest installed kernel; `reboot-required` marker; time zone and NTP sync; usage of `/` |
| Resources | RAM and swap usage; the heaviest CPU and RAM processes |
| Services | running services, compared with the recorded services (unexpected or missing is a finding) |
| Updates | total pending; of those `*-security`; held-back packages; last u-u run |
| SSH | effective values via `sshd -T` (RootLogin, PasswordAuth, MaxAuthTries, LoginGraceTime, ClientAlive*, X11, AllowUsers, Port) |
| Firewall | UFW status and open ports (or firewalld/nftables) |
| fail2ban | active jails; `dbpurgeage`; currently and total banned per jail |
| Users | accounts with UID 0 besides root; members of sudo/wheel |
| Logins | recent logins; failed SSH logins and most frequent source IPs |
| System updates | `unattended-upgrades` active; time for automatic reboot |
| Backup | `borgmatic.timer` active and next run; result of the last run; newest archive and gap check; age of the last restore proof and highest level ever reached (from the host's material, `callbell-sysadmin-restore-proof`) |

`/etc/shadow` is deliberately **not** read (safety rule); a check for empty passwords only on explicit request. Deeper forensics (authorized_keys across all users, checking cron and units, recursive search for file changes, processes and outbound connections) don't belong in this sweep, because they answer a different question. If something here looks like someone was on the host, that's the suspicion path: `callbell-sysadmin-incident`.

## Report layout

```markdown
---
description: >
  Server checkup report YYYY-MM-DD: all-round check, snapshot of the result.
type: knowledge
edit: shared
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Server checkup: YYYY-MM-DD

## Summary
<1 to 3 sentences: overall picture, number of findings, drift yes/no.>

## System
### [OK|INFO|FINDING|FIXED] <title>
- <finding with a number or evidence>

## Hardening
...

## Backup
...

## Open items
- [ ] <what's outstanding, with a date or condition>, or "None."
```

Markers: `[OK]` conformant · `[INFO]` worth noting, no action · `[FINDING]` deviation still open ·
`[FIXED]` corrected in this session.
