---
name: backup
description: >
  Set up (or retrofit) an encrypted off-site backup with BorgBackup + Borgmatic to an off-site SSH/SFTP
  storage target: repo init, config, notification, credentials, restore test. Trigger: "set up a backup",
  "retrofit a backup", Borg/Borgmatic.
type: skill
edit: locked
---

# Set Up a Backup: Borg + Borgmatic + Off-Site SSH/SFTP Storage

Sets up the standard backup across your servers. Per-server values (sub-account, webhooks, keys,
container list) belong in this server's backup context (its `__callbell__/` scaffold), **never** in the
repo or plugin.

> **3-2-1 principle:** 3 copies, 2 storage technologies, 1 off-site (an off-site SSH/SFTP storage target,
> e.g. a Hetzner Storage Box).

## Plan mode: decide first

- **Storage sub-account** for this server on the off-site storage target.
- **Backup time window:** staggered across your servers with a fixed, offset start time (no jitter),
  e.g. 03:00 / 03:15 / 03:30 / 03:45, so they do not all access at once. Auto-reboot (if active) sits
  **after** the window.
- **Notify channel:** a webhook channel + a healthcheck heartbeat (e.g. a monitoring push URL), your
  preferred channel, or e-mail (msmtp, e.g. Plesk). At least **one** channel is mandatory (success **and**
  failure).
- **Docker server?** -> additionally DB dumps before the backup (resource `db-dumps.md`).
- **Init system:** systemd (default, `borgmatic.timer`) or a cron fallback on non-systemd distros.

## Standard parameters

| Parameter | Value |
|---|---|
| Storage target | An off-site SSH/SFTP storage target (e.g. a Hetzner Storage Box); own sub-box per server |
| Interval | daily, fixed time from 03:00 (staggered across your servers) |
| Retention | 7 daily, 4 weekly, 6 monthly |
| Encryption | repokey-blake2 |
| Compression | zstd,3 |
| Standard directories | `/etc/`, `/home/`, `/opt/` (deviations per server) |

## Procedure

1. **Install tools** BorgBackup 1.2.x + Borgmatic 2.x (Debian/Ubuntu: `apt install borgbackup borgmatic`;
   otherwise the distro package or pipx). Verify the versions.
2. **Storage-target SSH key** generate it and register it on the storage target:
   `ssh-keygen -t ed25519 -f /root/.ssh/storage_box` (chmod 600); authorize the public key on the storage
   target (the provider's robot/console). Port 23 on a Hetzner Storage Box, for example.
3. **Generate the passphrase** and secure it: in a secrets vault (e.g. a password manager; mandatory,
   loss = total loss) **and** to `/root/.borg-passphrase` (chmod 600).
4. **Initialize the repo:**
   ```bash
   BORG_PASSPHRASE=$(cat /root/.borg-passphrase) \
   borg init --encryption=repokey-blake2 \
     --rsh "ssh -i /root/.ssh/storage_box -p <port>" \
     ssh://<user>@<storage-host>:<port>/./borg
   ```
   Then secure the key export: a secrets vault + `/root/.borg-key-backup` (chmod 600).
5. **Borgmatic config** create `/etc/borgmatic/config.yaml`: the source directories, the storage repo, the
   retention above, `repokey-blake2` encryption, and the notify hooks (see borgmatic's docs for the exact
   keys). On a Docker server the DB-dump hook goes in `before_backup` (the full hooks block is in
   `db-dumps.md`).
6. **Set up notify** per the section below. Put the notify script at `/root/backup/borg-notify.sh` and call
   it from the `on_error`/`after_backup` hooks. Real URLs/keys only in `/root/backup/backup.env` (chmod 600).
7. **Docker server:** wire in DB dumps before the backup -> `db-dumps.md`.
8. **Automation:** enable the systemd `borgmatic.timer` (time = your staggered slot). Non-systemd: a cron
   entry at the same time.
9. **First run + restore test:** `sudo borgmatic create --verbosity 1`, then restore a single file
   (see below) and document the date in this server's backup context.

## Notification

JSON payload to the webhook (uniform schema):
```json
{ "host": "<hostname>", "type": "backup", "status": "success | error",
  "timestamp": "<UTC ISO 8601>", "duration": <sec>, "error": "" }
```
Variables only in `/root/backup/backup.env`: `WEBHOOK_API_KEY`, `WEBHOOK_BACKUP_SUCCESS`,
`WEBHOOK_BACKUP_FAILURE`, `HEALTHCHECK_PUSH_URL`. **Secrets rule:** never output, log, or commit webhook
URLs/keys; in examples use a server alias instead of the real URL.

> **Borgmatic 2.x `commands:` syntax:** configure the `after: error` block **without a `when:` filter**,
> otherwise the error hook does not fire on failures in earlier hooks (e.g. a DB dump in
> `before: everything`). The real consequence of a `when: [create]` filter: 23 days of no notify, gone
> unnoticed, because the error hook did not fire on the earlier failures.

> **Healthcheck heartbeat** as a second layer: a healthcheck heartbeat (e.g. a monitoring push URL) with a
> heartbeat timeout (e.g. 26h for a daily backup), which catches even the case where the notify chain
> fails.

**E-mail alternative (msmtp):** instead of, or in addition to, the webhook, a mail script in the
`on_error`/`after_backup` hook; credentials only in `backup.env`/the msmtp config (chmod 600).

## Credentials backup

| What | Where |
|---|---|
| Borg passphrase | a secrets vault (e.g. a password manager; mandatory) + `/root/.borg-passphrase` (chmod 600) |
| Borg key export | a secrets vault + `/root/.borg-key-backup` (chmod 600) |
| Storage-target SSH key | `/root/.ssh/storage_box` (chmod 600) |

## Important commands

```bash
sudo borgmatic create --verbosity 1     # manual backup
sudo borgmatic list                     # archive list
sudo borgmatic info                      # status
# Restore (single file)
cd /tmp && sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<user>@<storage-host>/./borg::<ARCHIVE> path/to/file
```
