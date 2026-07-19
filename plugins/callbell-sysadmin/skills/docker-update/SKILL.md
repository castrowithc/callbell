---
name: docker-update
description: >
  Update a Docker stack or the Docker engine: update classes, stack workflow, DB major migration,
  prohibitions. Trigger: "update a Docker stack", "update the Docker engine", "new image version", a
  database major upgrade.
type: skill
edit: locked
---

# Docker Update Strategy

Covers stack and Docker-engine updates on your Docker servers. The current image/version state is read
live per server (`docker ps`). App-specific quirks and official sources live in this server's app notes (its
`__callbell__/` scaffold), one file per app.

## Update classes

| Update type | Risk | Approach |
|---|---|---|
| Security updates (system) | low | Install immediately (no Docker involvement, no restart) |
| System updates (system) | low | Install immediately (low risk) |
| **Docker-engine updates** (`docker-ce`, `containerd.io`, `docker-compose-plugin`) | **medium** | **Plan separately**: requires `systemctl restart docker`, so **all containers drop briefly**. Check container status first, then check all stacks afterwards |
| Stack image updates (app containers) | depends on the app | Use the stack update workflow (see below) |
| Database major upgrades | **high** | Needs its own migration (pg_dump/restore, mysqldump). **Never change the major version automatically** |
| Kernel updates | high | Schedule a maintenance window (restart required) |

## Stack update workflow

1. **Read the release notes**: official URLs from this server's app notes
2. **Check for breaking changes**: migrations, env-variable changes, volume layout
3. **Backup present?**: is the last Borg backup `OK` (`sudo borgmatic info`)? On DB-schema changes, weigh
   whether a manual dump is needed
4. **Adjust the version**: set `image:` in `/opt/stack/<service>/compose.yaml` to the new tag
5. **Pull + restart**: `cd /opt/stack/<service> && docker compose pull && docker compose up -d`
6. **Check the logs**: `docker compose logs --tail=200 <service>` for errors/warnings
7. **Function check**: verify login plus a core function in the application
8. **On success**: the version is live (`docker ps`), no version column to maintain; add any new
   quirks/pitfalls to this server's app notes if needed
9. **On failure**: roll back to the old tag (revert `compose.yaml`, `up -d`), save the logs, analyze the
   problem before trying the update again

## Database image updates

- **Minor/patch version** (`postgres:17.1` to `17.2`): uncritical, treat like a stack update
- **Major version** (`postgres:16` to `17`): **STOP**.
  1. DB dump (`pg_dumpall`) on the old version
  2. Back up the data directory (`./data/postgres` to a tarball)
  3. Start compose with the new major version plus an empty data directory
  4. Restore the dump
  5. Function check
  6. Only then discard the old data directory

For all-in-one containers (e.g. OpenProject) the DB version follows the app's major tag: follow the
vendor's own migration steps.

## Special cases (typical)

- **Apps with several images pinned in sync** (e.g. Penpot: frontend + backend + exporter): update all
  images in the same step, never one at a time
- **Apps with their own migration script** (e.g. SeaTable, Nextcloud): run the migration instructions from
  the release notes before `docker compose up -d`
- **Apps with a sequential major path** (e.g. Nextcloud: 28 to 29 to 30): never skip versions, work through
  each major individually with a check in between

## Docker engine update

```bash
# Status beforehand
docker ps --format 'table {{.Names}}\t{{.Status}}'

# Update
sudo apt-get update
sudo apt-get install -y --only-upgrade docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# Restart (all containers are briefly interrupted)
sudo systemctl restart docker

# Containers come back automatically via `restart: unless-stopped`: check
sleep 10
docker ps --format 'table {{.Names}}\t{{.Status}}'

# Check the logs of the just-stopped containers for errors
```

## Prohibitions

- **No automatic updating** (e.g. via Watchtower) without explicit per-stack configuration
- **No `:latest` tags** in compose.yaml: they defeat reproducible state detection
- **No major updates without checking the release notes**
- **No `docker system prune -a`** without backing up the stack directories: it deletes images that may be
  needed for a rollback
