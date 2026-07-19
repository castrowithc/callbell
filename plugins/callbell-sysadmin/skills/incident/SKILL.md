---
name: incident
description: >
  Suspicion sweep for a host you think has been touched: a fast read-only triage of access, persistence,
  processes, network and containers, compared against what the host's own records say should be there,
  followed by targeted follow-up on whatever does not match. Never searches the filesystem and never
  changes anything. Start it by typing /callbell-sysadmin:incident.
type: skill
edit: locked
disable-model-invocation: true
---

# Server Incident: Triage, Targeted Follow-Up, Response

For a host under suspicion. The routine sweep asks whether the running state still matches the baseline.
This one asks a different question: did someone establish access, persistence, or a foothold here. Drift
detection does not answer it, because an attacker with root leaves the baseline intact.

**Boundary (not a duplicate):** `callbell-sysadmin:checkup` is the periodic health sweep and writes a dated
report. This runs on suspicion, gathers different evidence, and writes nothing to disk.

## Two rules that shape everything below

**The host stays usable.** This runs on production. A sweep that saturates I/O takes the services down with
it, and the page cache it evicts keeps the database slow long after the sweep is done. So the triage reads
known paths and kernel state only. It never searches the filesystem. If the evidence calls for a
filesystem-wide search, that happens on a copy, not here.

**This skill gathers and explains, it does not decide.** It hands the operator evidence and a reading of
it. Every action, every command that changes the host, every decision to isolate or rebuild is theirs. Where
they want something this skill does not do, the answer is to work it out together in the session, not to
widen the skill until it acts on its own.

## Step 1: read the records first

Before collecting anything, read what the host's own domain says about itself: its purpose, its documented
services, users, stack, and ports. That turns every later block from a list into a comparison, which is the
whole difference between triage and staring at output.

If there are no records, that is a working state and not an error. The realistic incident is that this pack
gets installed *because* suspicion already exists. Then the comparison runs against what is normal for this
kind of host, and every finding says so. Never upgrade an unverifiable observation into a finding to make
the reading look decisive.

Say which of the two bases you are on before reporting anything.

## Step 2: triage

Run this skill folder's `incident.sh`. It throttles itself (idle I/O class, nice 19), caps every block with
a timeout, and finishes in seconds on a normal host:

```bash
sudo bash incident.sh
```

Do not redirect the output to a file on the host. See "No report file" below.

The blocks are ordered by volatility, not by importance: sockets and processes disappear on a reboot or
when a process exits, while `authorized_keys` and cron entries stay. Collect what vanishes first.

| Block | What it answers | Why it is cheap |
|---|---|---|
| Network listeners and outbound | Is something reachable, or calling out? | kernel socket table |
| Processes | Anything running from a deleted binary or an odd path? | `/proc` only |
| Logins and sudo | Who actually got in, and what did they run? | one log file, tail only |
| Privileged accounts, `authorized_keys` | Who *can* get in? | a handful of known files |
| Cron, systemd units, shell init, `ld.so.preload` | How would they come back? | known directories, listed not searched |
| Docker | Containers and images against the documented stack | daemon API |

Highest value per cost sits at the top: a backdoor has to be reachable or has to call out, so an
undocumented listener or an unexplained outbound connection carries more than anything else in the list.

## Step 3: follow up, targeted

Triage produces a handful of things that do not match. Each one gets pursued specifically, and what to run
follows from the finding rather than from a script written in advance.

An undocumented listener on a port means: which process, which binary, when was it last modified, who owns
it, what starts it. An unexplained cron entry means: what does it call, when did the file appear, which
account owns it. A key nobody recognises means: when was the file last written, which account, and does a
login in the log line up with that time.

That is a handful of cheap commands each, because the target is known. It is also the step where a
filesystem-wide search would have been the lazy substitute for thinking, at a hundred times the cost.

## Step 4: secure before anything changes

If the evidence points at a live compromise, capture what is volatile before proposing any action: the
process list, the socket list, the relevant log excerpts, into the session. On a host that matters, propose
a provider-level snapshot before anything is touched.

Restarting a service to tidy it up can destroy the only record of how the foothold worked. Snapshot first,
investigate second, and change nothing until the operator has decided.

## Step 5: hand over the decision

Name what the evidence supports, how confident it is, and what is still open. Then lay out the options with
what each costs if the reading is wrong. A host whose state cannot be explained is one to **isolate**
rather than to tidy: pulling it off the network preserves evidence, while cleaning destroys it.

Carry out only what the operator agreed to, then state plainly what changed and what was left alone. The
pack's safety layer already requires explanation and confirmation before destructive commands, and this is
exactly the situation it exists for.

## Deep inspection belongs on a copy

Some questions genuinely need a filesystem-wide search: has a system binary been replaced, is there a SUID
binary nobody installed, what else was written the day the intrusion started. Those questions are answered
on a snapshot, mounted somewhere else, never on the running host. Two reasons, and the second is the one
that settles it:

1. Cost. Walking the whole filesystem and verifying every package file is heavy I/O and evicts the page
   cache the running services depend on.
2. Trust. A rootkit can lie to `find`, `ls`, `ps`, and to the package verifier, because they all ask the
   kernel it has already subverted. On the live host such a scan is expensive **and** unreliable, which is
   the worst combination available.

So the path is: snapshot the volume with the provider, attach it to a separate machine, and run the heavy
tools there against a filesystem nothing is defending. `debsums -c` or `rpm -Va` for package integrity, a
SUID/SGID sweep, and a modification-time sweep around the suspected window. Scanners such as `rkhunter`,
`chkrootkit` or `Lynis` belong there too. Never install a scanner on the host under suspicion: it writes to
the disk, changes package state, and tells whoever is being investigated that a search is running.

If the operator wants a live deep scan anyway, that is their call to make and their command to run. It is
outside what this skill does, and the reason is in the two points above rather than in a preference.

## No report file

Unlike the routine checkup, the finding is not written to the host. Under suspicion the host is the wrong
place to keep it: the file is manipulable by whoever is being investigated, and it advertises that a search
happened and what it looked for. The finding lives in the session. If the operator wants it kept, it gets
secured somewhere off the host, on their say-so.

## Reading schema

Report in the session, in this shape:

```markdown
# Incident triage: <host>, YYYY-MM-DD

## Basis
<Documented records available, or judged against normal-for-this-kind-of-host. One sentence.>

## Summary
<1-3 sentences: what the evidence supports, how confident, what is still open.>

## Did not match
### [FINDING|NOTE|UNVERIFIABLE] <title>
- <observation with evidence> (basis: record | normal-for-host)
- <what the targeted follow-up showed>

## Matched the record
- <blocks that came back clean, one line each>

## Options
1. <option, and what it costs if the reading is wrong>

## Not answered from here
- <what needs the snapshot path, and which question it would settle>
```

Markers: `[FINDING]` needs an explanation or a response · `[NOTE]` worth mentioning, not suspicious on its
own · `[UNVERIFIABLE]` observed, cannot be judged from this host.
