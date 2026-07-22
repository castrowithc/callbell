---
name: callbell-sysadmin-docker-update
description: >
  Updates a Docker stack or the Docker engine: update classes, per-stack flow, migration on database major
  versions, prohibitions. Start it by typing /callbell-sysadmin-docker-update.
type: skill
edit: locked
disable-model-invocation: true
---

# Docker update strategy

Covers updates to stacks and the Docker engine on your Docker servers. Which images and versions are running is read live per server (`docker ps`). An application's quirks and its official sources live in this host's domain (folder `<host>/`), one file per application.

## Update classes

| Kind of update | Risk | Approach |
|---|---|---|
| Security updates (system) | low | apply immediately (no Docker involved, no restart) |
| System updates (system) | low | apply immediately (low risk) |
| **Docker engine updates** (`docker-ce`, `containerd.io`, `docker-compose-plugin`) | **medium** | **plan separately**: needs `systemctl restart docker`, **all containers drop briefly**. Check container status first, review all stacks after |
| Image updates of a stack (application container) | depends on the application | per-stack flow (see below) |
| Database major-version change | **high** | needs its own migration (pg_dump/restore, mysqldump). **Never change the major version automatically** |
| Kernel updates | high | schedule a maintenance window (reboot needed) |

## Per-stack flow

1. **Read the release notes**: the official addresses from this host's application notes
2. **Check for breaking changes**: migrations, changed environment variables, volume layout
3. **Backup in place?**: is the last Borg backup `OK` (`sudo borgmatic info`)? On database-schema changes,
   weigh whether a manual dump is needed
4. **Adjust the version**: set `image:` in `/opt/stack/<service>/compose.yaml` to the new tag
5. **Pull and restart**: `cd /opt/stack/<service> && docker compose pull && docker compose up -d`
6. **Check logs**: `docker compose logs --tail=200 <service>` for errors and warnings
7. **Function check**: exercise login and a core function of the application
8. **On success**: the version is running (`docker ps`), there's no version column to maintain; add new
   quirks and pitfalls to this host's application notes if needed
9. **On failure**: back to the old tag (revert `compose.yaml`, `up -d`), save the logs, analyze the problem
   before retrying the update

## Database image updates

- **Minor or patch version** (`postgres:17.1` to `17.2`): uncritical, treat like a stack update
- **Major version** (`postgres:16` to `17`): **STOP**.
  1. Dump the database (`pg_dumpall`) on the old version
  2. Back up the data directory (`./data/postgres` into a tar archive)
  3. Start compose with the new major version and an empty data directory
  4. Load the dump
  5. Function check
  6. Only then discard the old data directory

For all-in-one containers (e.g. OpenProject) the database version follows the application's main tag:
follow the vendor's migration steps.

## Special cases (typical)

- **Applications with several images pinned together** (e.g. Penpot: frontend, backend, exporter): update
  all images in the same step, never singly
- **Applications with their own migration script** (e.g. SeaTable, Nextcloud): run the migration
  instructions from the release notes before `docker compose up -d`
- **Applications with a stepwise major-version path** (e.g. Nextcloud: 28 to 29 to 30): never skip
  versions, walk each major version one at a time, with a check in between

## Docker engine update

```bash
# status before
docker ps --format 'table {{.Names}}\t{{.Status}}'

# update
sudo apt-get update
sudo apt-get install -y --only-upgrade docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# restart (all containers are briefly interrupted)
sudo systemctl restart docker

# containers return on their own via `restart: unless-stopped`: check
sleep 10
docker ps --format 'table {{.Names}}\t{{.Status}}'

# check the just-stopped containers' logs for errors
```

## Prohibitions

- **No automatic updating** (e.g. via Watchtower) without explicit per-stack configuration
- **No `:latest` tags** in the compose.yaml: they make reproducible state detection impossible
- **No major-version changes without having read the release notes**
- **No `docker system prune -a`** without having backed up the stack directories: it deletes images that a
  rollback might still need
