---
name: callbell-sysadmin-backup
description: >
  Sets up or retrofits an encrypted, off-site backup with BorgBackup and Borgmatic to an SSH/SFTP target:
  create the repo, configuration, notification, credentials, restore test. Start it by naming
  callbell-sysadmin-backup.
disable-model-invocation: true
license: MIT
type: skill
edit: locked
---

# Setting up a backup: Borg + Borgmatic + off-site SSH/SFTP target

Set up the backup on a server so the shape stays the same as they multiply. Values that differ per server (sub-account, webhooks, keys, container list) belong in this host's domain (folder `<host>/`), **never** in the repo or the plugin.

> **3-2-1 principle:** 3 copies, 2 storage media, 1 off-site (an off-site SSH/SFTP target, e.g. a Hetzner
> Storage Box).

## Plan mode: decide first

- **Storage sub-account** for this server on the off-site target.
- **Time window:** a fixed start time, no jitter, in the host's quiet hours. With one server you pick the
  time and you're done. Once several back up to the same target, stagger them (03:00 / 03:15 / 03:30 and so
  on) so they don't all hit it at once. An automatic reboot, if active, sits **after** the window.
- **Notification path:** a webhook plus a healthcheck heartbeat (e.g. a monitoring push URL), your
  preferred channel, or email (msmtp, e.g. on Plesk). At least **one** path is mandatory (success **and**
  failure).
- **Docker server?** → additionally database dumps before the backup (companion file `db-dumps.md`).
- **Init system:** systemd (the common case, `borgmatic.timer`) or a cron substitute on distributions
  without systemd.

## Defaults

| Value | Default |
|---|---|
| Target | an off-site SSH/SFTP target (e.g. a Hetzner Storage Box); own sub-account per server |
| Cadence | daily, at a fixed quiet time (staggered per server once there are several) |
| Retention | 7 daily, 4 weekly, 6 monthly |
| Encryption | repokey-blake2 |
| Compression | zstd,3 |
| Default directories | `/etc/`, `/home/`, `/opt/` (deviations per server) |

## Procedure

1. **Install tools:** BorgBackup 1.2.x and Borgmatic 2.x (Debian/Ubuntu:
   `apt install borgbackup borgmatic`; otherwise the distribution's package or pipx). Check versions.
2. **Generate an SSH key for the target** and install it there:
   `ssh-keygen -t ed25519 -f /root/.ssh/storage_box` (chmod 600); authorize the public key on the target
   (the provider's robot or console). On a Hetzner Storage Box, port 23 for instance.
3. **Generate a passphrase** and secure it: in a password store (mandatory, losing it means total loss)
   **and** to `/root/.borg-passphrase` (chmod 600).
4. **Create the repo:**
   ```bash
   BORG_PASSPHRASE=$(cat /root/.borg-passphrase) \
   borg init --encryption=repokey-blake2 \
     --rsh "ssh -i /root/.ssh/storage_box -p <port>" \
     ssh://<user>@<target-host>:<port>/./borg
   ```
   Then secure the key export: the password store plus `/root/.borg-key-backup` (chmod 600).
5. **Create the Borgmatic config** `/etc/borgmatic/config.yaml`: source directories, target repo, the
   retention from above, encryption `repokey-blake2`, and the notification hooks (the exact keys are in
   borgmatic's documentation). On a Docker server the database-dump hook belongs in `before_backup` (the
   full hooks block is in `db-dumps.md`).
6. **Set up notification** per the section below. Put the script in a stable root-owned location (this
   procedure uses `/root/backup/borg-notify.sh`) and call it from the `on_error`/`after_backup` hooks. Real
   addresses and keys only in a chmod-600 env file beside it.
7. **Docker server:** hook database dumps in before the backup → `db-dumps.md`.
8. **Automate:** enable the systemd timer `borgmatic.timer` at the time set above. Without systemd, a cron
   entry at the same time.
9. **First run and restore test:** `sudo borgmatic create --verbosity 1`, then pull back a single file
   (see below) and record the date in this host's domain.

## Notification

What matters: success **and** failure reach you, and the message says which host, which run, and what went wrong. The form below is a working convention, not a schema anyone expects:

```json
{ "host": "<hostname>", "type": "backup", "status": "success | error",
  "timestamp": "<UTC ISO 8601>", "duration": <sec>, "error": "" }
```

Adopt it, or follow whatever your receiver already reads. Same for placement: this procedure puts the script and secrets under `/root/backup/`, with variable names like `WEBHOOK_BACKUP_SUCCESS` and `HEALTHCHECK_PUSH_URL`, a decent default and no more. A host that already has a place for operations scripts uses that place.

Whatever the placement, one thing is fixed: real addresses and keys live only in an env file only root can read (chmod 600), never in the borgmatic config. **Secrets rule:** never print, never log, never commit webhook addresses and keys; in examples use a server alias instead of the real address.

> **`commands:` syntax in Borgmatic 2.x:** configure the `after: error` block **without a `when:` filter**,
> or the error hook won't fire on failures in earlier hooks (e.g. a database dump in `before: everything`).
> The real cost of a `when: [create]` filter: 23 days without notification, unnoticed, because the error
> hook didn't fire on the earlier failures.

> **Healthcheck heartbeat** as a second layer: a heartbeat (e.g. a monitoring push URL) with a deadline
> (e.g. 26 hours for a daily backup) that catches even when the notification chain fails.

**Email alternative (msmtp):** instead of the webhook or in addition, a mail script in the
`on_error`/`after_backup` hook; credentials only in `backup.env` or the msmtp config (chmod 600).

## Securing the credentials

| What | Where |
|---|---|
| Borg passphrase | password store (mandatory) plus `/root/.borg-passphrase` (chmod 600) |
| Borg key export | password store plus `/root/.borg-key-backup` (chmod 600) |
| SSH key for the target | `/root/.ssh/storage_box` (chmod 600) |

## Key commands

```bash
sudo borgmatic create --verbosity 1     # manual backup
sudo borgmatic list                     # list archives
sudo borgmatic info                     # status
# restore (single file)
cd /tmp && sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<user>@<target-host>/./borg::<ARCHIVE> path/to/file
```
