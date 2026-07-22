---
description: >
  A host's inventory: the basics you'd otherwise re-gather every session.
type: knowledge
edit: shared
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <host>

<!-- Template. Copy it to <host>/index.md. What's here the agent read from the machine, not
asked the user for. Asking costs the user time on something a command knows. -->

## System
| | |
|---|---|
| Hostname | |
| Distribution | <!-- cat /etc/os-release --> |
| Init | <!-- ps -p1 -o comm= --> |
| Package manager | |
| Provider | |
| CPU / RAM / Disk | |

## Access
<!-- Admin user, SSH port, authentication path. Never keys, passwords, or tokens: the core's
data-protection norm holds here unchanged, and this repo may become public. -->

## What runs here
<!-- Services, stacks, applications. One line per thing, with what you need to know not to hit it by
accident. Grows over time; a new service joins here as long as it needs no file of its own. -->

## Backup
<!-- Whether it's backed up, where to, how often, and when a restore was last proven. A running backup
without a proven restore is no backup. -->

## Hardening
<!-- The state against the baseline and every deliberate deviation with its reason. -->
