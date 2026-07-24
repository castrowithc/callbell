---
name: callbell-sysadmin-help
description: >
  Quick reference to callbell-sysadmin: whether the pack is active here, how to switch it on, which skill you
  want when, and which of them only read. Shown once, not a persistent mode. Start it by naming
  callbell-sysadmin-help.
disable-model-invocation: true
license: MIT
type: skill
edit: locked
---

# Callbell Sysadmin Help

Show this card when called. Once, no mode change, nothing saved.

**Check what applies first** and show the matching one of the three states: the card says what's going on *here*, it doesn't list every possibility. The state lives in `__callbell__/.host-identity`.

## 1. Is the pack active here?

| `.host-identity` | What it means | What loads |
|---|---|---|
| missing | no server context: a normal repo, no host | nothing server-specific, and that's deliberate |
| present, empty | you work from your own machine by remote administration | the safety layer, no domain set |
| present, with content | the agent runs on the host; the content is the domain folder | the safety layer, domain set |

The silence in the first case is the function, not a fault: the pack installs machine-wide, and a code repo should get no server text.

## 2. How do I switch it on?

```
/callbell-sysadmin-add-host
```

It creates the working folder: one folder per host with `framework.md` and `index.md`, reads the machine's own inventory, and writes the identity. On an unprovisioned machine it then offers to bring the box up. It runs on a server that's been up for ages too; no reinstall needed.

From the **next** session on, the hook names the domain and the safety layer is there.

## 3. Which skill do I want?

In the order you meet them:

| Skill | For | On the system |
|-------|-----|---------------|
| **add-host** | create the host domain (once per host), and provision the box if it's unfinished | creates files; **changes** only when it provisions |
| **harden** | harden to the security baseline, or check an existing hardening | **changes** |
| **backup** | set up or retrofit an encrypted, off-site backup | **changes** |
| **restore-proof** | prove the backup restores (in scratch, never live) | reads, writes scratch only |
| **deploy** | set up a new Docker stack by fixed conventions | **changes** |
| **docker-update** | update a stack or the Docker engine | **changes** |
| **checkup** | the routine "is everything still running well", as a dated report | reads, writes the report |
| **incident** | suspect someone was on the host: a fast triage | **reads only**, changes nothing |
| **help** | this card | shows only |

`add-host` provisions an unfinished machine and calls `harden`, `backup`, and `deploy` in turn. On a server that's already running it just lays down the domain, and you reach for those one by one.

## 4. What reads and what changes?

The column above is the short answer, and before a run on a production system it's the one that matters most. Two notes:

- **`incident` writes nothing on purpose**, not even a report to the host. Under suspicion, the host is the wrong place for the finding.
- **Changing skills don't decide alone.** The safety layer demands explanation and confirmation before destructive commands, and no skill in this pack starts itself: you type each one.

## Namespace

The skills carry the pack prefix `callbell-sysadmin-` in their name, so you find them all at once by typing `/callbell-sysadmin`. Codex calls the same skills with the `@` prefix. The core sits underneath and is required: `/callbell-help` shows its card.
