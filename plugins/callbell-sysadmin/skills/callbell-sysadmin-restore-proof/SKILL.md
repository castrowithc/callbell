---
name: callbell-sysadmin-restore-proof
description: >
  Proves a backup restores, rather than just checking that it runs: three escalating restore levels into a
  scratch path, each saying what it proves and what stays open. Also covers the case with no backup at all.
  Start it by typing /callbell-sysadmin-restore-proof.
type: skill
edit: locked
disable-model-invocation: true
---

# Prove the restore, don't just run the backup

`callbell-sysadmin-backup` sets up the backup, `callbell-sysadmin-checkup` checks that the timer fires, how the last run went, and how old the newest archive is. All of that measures the process, none of it measures the backup itself. A firing timer and a growing archive are consistent with a backup that won't restore: an excluded path no one noticed, a database backed up mid-write, a passphrase that lives only on the backed-up machine, a key lost with the host. Each of these is invisible until the day it counts, and on that day it's no longer fixable.

Close the gap with a procedure. Restore **never over live data**, always into a scratch path, and clean up after. Rehearsing a restore in place is how a bad backup becomes a bad outage, and the pack's safety layer treats overwriting live paths as destructive anyway.

## Branch first: is there a backup?

- **Yes, a running backup** (borgmatic/Borg per `callbell-sysadmin-backup`, or another method): continue
  with the three levels.
- **No, or none anyone trusts**: continue with the "No backup" section below. That's a first-class path,
  not a failure.

First read what's recorded about the host (folder `<host>/`, the backup section in `index.md`): what's backed up, where to, and which level was last proven. That tells you where to start and what's never been tested.

## The three levels: escalating

A proof is worth more the closer it sits to a real loss. So escalate rather than pick a level. Each level builds on the one before. Everything is pulled back into `/tmp/restore-proof/` (or another scratch path), never to the original location.

| Level | What it pulls back | What it proves | What it does **not** prove |
|---|---|---|---|
| 1 | a single file, hashed against the original | archive readable, passphrase correct, storage path reachable | nothing about exclusions or databases |
| 2 | a directory that matters, with permissions and owner, diffed against the live copy | that the important paths really are in the archive (silent exclusions surface) | nothing about internal database state |
| 3 | a database from the dump into a scratch instance, a query against it | that the dump is consistent and loadable | only as much as the one database checked |

### Level 1: a single file

Pull a file from the newest archive into the scratch path and compare it with the original (Borg example; for another method, its counterpart):

```bash
mkdir -p /tmp/restore-proof && cd /tmp/restore-proof
sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract --strip-components 0 ssh://<user>@<target-host>/./borg::<ARCHIVE> etc/hostname
sudo cmp /etc/hostname /tmp/restore-proof/etc/hostname && echo "Level 1: OK"
```

If this fails, the archive, passphrase, or storage path is broken, and that's most of what goes wrong. Pick a small, stable file that compares reliably.

### Level 2: a directory that matters

Pull back a directory you'd need in a real recovery (e.g. an application's `/etc/` or a config tree), with permissions and owner, and diff it against the live copy:

```bash
sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<user>@<target-host>/./borg::<ARCHIVE> etc/<path>
sudo diff -r --brief /etc/<path> /tmp/restore-proof/etc/<path>
sudo ls -la /tmp/restore-proof/etc/<path>   # check permissions and owner
```

The surprises sit here, because the diff shows what's **not** in the archive. Every file that's live but missing from the restore is a silent exclusion and a finding. Permissions or owner that don't match make a real restore useless, even when the bytes are there.

### Level 3: a database

Only on a host with database dumps (Docker server, `db-dumps.md`). Pull a dump into the scratch path, load it into a **scratch instance** (never the live database), and run a query:

```bash
# pull the dump from the archive
sudo BORG_PASSPHRASE=$(sudo cat /root/.borg-passphrase) \
  BORG_RSH="ssh -i /root/.ssh/storage_box -p <port>" \
  borg extract ssh://<user>@<target-host>/./borg::<ARCHIVE> root/backup/borg/db-dumps/<container>.sql

# start a scratch instance (PostgreSQL example), load, one query, then remove
docker run -d --rm --name restore-proof-db -e POSTGRES_PASSWORD=scratch postgres:16
sleep 5
docker exec -i restore-proof-db psql -U postgres \
  < /tmp/restore-proof/root/backup/borg/db-dumps/<container>.sql
docker exec restore-proof-db psql -U postgres -c '\dt'   # tables there? run a real query
docker stop restore-proof-db
```

A dump pulled during writes fails exactly here and at no earlier level. The scratch instance is disposable and never touches the live database.

### After each level: say what stays open

Whoever ran only level 1 has **not** proven their database, and that belongs said plainly, not dressed up as a green result. Name the level reached and the next one still outstanding.

## No backup: what to protect first

If there's nothing, the question isn't "set up a backup" alone, but what can be protected **now**, in what order, with what's there. The order follows irreplaceability, not size:

1. **Data that exists nowhere else** (user content, databases) beats anything reinstallable.
2. **Configuration that was a day's work** is worth more than the packages it configures.
3. **Volatile service state** (only in memory or a container volume) is the easiest to lose and the least
   noticed.

Where no full backup is possible today, say what a partial one buys and what it leaves open, rather than treating everything short of full as a failure. A `pg_dumpall` to off-site storage tonight is more than the perfect design next week.

## Cleanup and safety

- **Never touch the live path**, at any level. Restore only into `/tmp/restore-proof/`, database only into a
  scratch instance.
- **Remove scratch after:** `sudo rm -rf /tmp/restore-proof` and stop the scratch database. A pulled-back
  dump holds plaintext application data, it must not linger.
- **Print no secrets:** passphrase and keys are read, never written to the log or the chat (the pack's
  safety layer).

## Record

The result belongs in the host's material (`<host>/index.md`, backup section), with the date and level reached, so a later run sees what was never proven. Two lines are enough, this is not a report:

```
Restore proof 2026-07-21: level 2 passed (file + directory /etc/nginx, permissions/owner ok).
Open: level 3 (database) never proven.
```

`callbell-sysadmin-checkup` reads these lines on its sweep and reports when the last proof is old or a level was never reached.
