---
name: callbell-sysadmin-incident
description: >
  Suspected-breach pass for a host someone may have reached: a fast, read-only triage of access,
  persistence, processes, network, and containers, compared with what's recorded about the host, then
  targeted follow-up on anything that doesn't fit. Never searches the filesystem, never changes anything.
  Start it by typing /callbell-sysadmin-incident.
type: skill
edit: locked
disable-model-invocation: true
---

# Server incident: triage, targeted follow-up, response

For a host under suspicion. The routine sweep asks whether the running state still matches the baseline. This one asks a different question: has someone gained access, persistence, or a foothold here. The drift check doesn't answer it, because an attacker with root leaves the baseline intact.

**Boundary, so nothing sits here twice:** `callbell-sysadmin-checkup` is the regular health sweep and writes a dated report. This one runs on suspicion, gathers different evidence, and writes nothing to disk.

## Two rules that shape everything below

**The host stays usable.** This runs on a production system. A pass that saturates I/O drags the services down with it, and the page cache it evicts keeps the database slow long after. So the triage reads only known paths and kernel state. It never searches the filesystem. If the evidence demands a search across the whole filesystem, that happens on a copy, not here.

**Gather and explain, don't decide.** Give the operator the evidence and a reading of it. Every action, every command that changes the host, every decision to isolate or rebuild, is theirs. Where they want something this skill doesn't do, the answer is to work it out together in the session, not to widen the skill until it acts on its own.

## Step 1: read the records first

Before you gather anything, read what the host's domain says about itself: purpose, recorded services, users, stack, and ports. That turns every later block into a comparison rather than a list, and that's exactly the difference between triage and staring at output.

No records is a working state, not a fault. The realistic incident is the one where this pack gets installed *because* the suspicion already exists. Then the comparison runs against what's normal for a host of this kind, and every finding says so. Never raise an unverifiable observation to a finding to make the reading look more decisive.

Say which of the two bases you stand on before you report anything.

## Step 2: triage

Run this skill folder's companion file `incident.sh`. It throttles itself (I/O class idle, nice 19), caps each block with a timeout, and finishes in seconds on a normal host:

```bash
sudo bash incident.sh
```

Don't redirect the output to a file on the host. See "No report file" below.

The blocks are ordered by volatility, not importance: sockets and processes vanish on a reboot or when a process ends, while `authorized_keys` and cron entries stay. Gather what's fleeting first.

| Block | What it answers | Why it's cheap |
|---|---|---|
| Listeners and outbound connections | Is something reachable, or is something calling out? | the kernel's socket table |
| Processes | Is something running from a deleted file or an odd path? | `/proc` only |
| Logins and sudo | Who actually got in, and what did they run? | one log file, just the tail |
| Privileged accounts, `authorized_keys` | Who *can* get in? | a handful of known files |
| cron, systemd units, shell init, `ld.so.preload` | How would someone get back in? | known directories, listed not searched |
| Docker | containers and images against the recorded stack | the daemon's API |

The most value per cost is at the top: a backdoor has to be reachable or call out, so an unrecorded listener or an unexplained outbound connection weighs heavier than anything else on the list.

## Step 3: targeted follow-up

The triage turns up a handful of things that don't fit. Chase each one on its own, and what to do follows from the finding, not from a pre-written script.

An unrecorded listener on a port means: which process, which file, last modified when, owned by whom, started by what. An unexplained cron entry means: what does it call, when did the file appear, which account owns it. A key no one knows means: when was the file last written, by which account, and does a login in the log match that time.

Each is a handful of cheap commands, because the target is known. It's also the step where a search across the whole filesystem would have been the easy substitute for thinking, at a hundred times the cost.

## Step 4: preserve before anything changes

If the evidence points to a live compromise, capture the volatile things before you propose any action: the process list, the socket list, the relevant log excerpts, into the session. On a host that matters, propose a snapshot at the provider before anything is touched.

Restarting a service to clean up can destroy the only trace of how the foothold worked. Snapshot first, then investigate, and change nothing before the operator has decided.

## Step 5: hand over the decision

Name what the evidence supports, how sure that is, and what stays open. Then lay out the options, with what each costs if the reading is wrong. A host whose state can't be explained you **isolate**, rather than clean up: taking it off the network preserves traces, scrubbing it destroys them.

Run only what the operator agreed to, and afterward say clearly what changed and what stayed untouched. The pack's safety layer demands explanation and confirmation before destructive commands anyway, and this is exactly the situation it's there for.

## Deep investigation belongs on a copy

Some questions really do need a search across the whole filesystem: was a system file replaced, is there a SUID file no one installed, what else was written on the day the break-in began. Answer these on a snapshot, mounted elsewhere, never on the running host. Two reasons, and the second one decides:

1. Cost. Walking the whole filesystem and checking every package file is heavy I/O and evicts the page
   cache the running services depend on.
2. Trust. A rootkit can lie to `find`, `ls`, `ps`, and the package verifier, because they all ask the
   kernel it has already subverted. On the running host such a scan is expensive **and** unreliable, the
   worst available combination.

So the path is: snapshot the volume at the provider, attach it to a separate machine, and run the heavy tools there against a filesystem no one is defending. `debsums -c` or `rpm -Va` for package integrity, a pass over SUID/SGID and one over modification times around the suspected window. Scanners like `rkhunter`, `chkrootkit`, or `Lynis` belong there too. Never install a scanner on the suspect host: it writes to disk, changes the package state, and tells whoever is being investigated that a search is on.

If the operator wants a deep scan on the running system anyway, that's their decision and their command. It lies outside what this skill does, and the reason is in the two points above, not in a preference.

## No report file

Unlike the routine checkup, the finding is not written to the host. Under suspicion the host is the wrong place for it: the file is tamperable by whoever is being investigated, and it reveals that a search happened and what for. The finding lives in the session. If the operator wants to keep it, it's saved off the host on their word.

## Reading layout

Report in the session, in this form:

```markdown
# Incident triage: <host>, YYYY-MM-DD

## Basis
<Recorded material present, or judged against what's normal for this kind of host. One sentence.>

## Summary
<1 to 3 sentences: what the evidence supports, how sure, what stays open.>

## Didn't fit
### [FINDING|NOTE|UNVERIFIABLE] <title>
- <observation with evidence> (basis: record | normal for this host)
- <what the targeted follow-up found>

## Matched the record
- <blocks that came back clean, one line each>

## Options
1. <option, and what it costs if the reading is wrong>

## Not answerable from here
- <what needs the snapshot path, and which question it would settle>
```

Markers: `[FINDING]` needs an explanation or a response · `[NOTE]` worth mentioning, not suspicious on its
own · `[UNVERIFIABLE]` observed, not judgable from this host.
