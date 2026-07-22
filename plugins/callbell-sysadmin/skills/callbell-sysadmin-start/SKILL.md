---
name: callbell-sysadmin-start
description: >
  The way into callbell-sysadmin: creates the server working folder or adds another host domain beside it,
  reads the host's own inventory, and sets the host identity. Start it by typing /callbell-sysadmin-start.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-sysadmin-start

The first stop in a server working folder. The hook tells each session which domain is its workspace; here you create that domain.

**A domain is a folder named after the host, and it reads like a small repo of its own without its own git:** everything about that machine lives in it, and `__callbell__/` is the one shared center. It carries `framework.md` (how the host is run) and `index.md` (what's on it), and grows lazily: new material joins an existing file where one fits, otherwise it becomes a new one below.

**It normally runs on the host itself**, because that's where the agent runs. The exception is the user working from their own machine by remote administration; see step 5.

**The one rule to hang on: report only what's missing.** A check that reports success is noise. In a set-up folder, a run is one line.

## 1. Dependencies (silent when met)

This pack requires the core, and the core creates `__callbell__/`. So check the scaffold stands first. If it's missing, that's not this skill's failure: call `/callbell-start`, let it do its work, then continue here. If it stands, say nothing about it.

This holds even when someone later reaches straight for a sweep without ever having been here: the check runs, it just stays quiet as long as there's nothing to do.

## 2. Branch on what you find

There are exactly two cases, told apart by whether a host domain already sits beside `__callbell__/`:

- **No domain yet:** the folder is new for this purpose. Create the whole thing: ship templates (step 3), the first domain, the ruleset in the root (step 6).
- **At least one domain present:** another one joins. **Don't touch the existing ones.** Not their files, not their structure; the second domain forms beside them, and if something about the first stands out along the way, that's a remark to the user, not a change.

## 3. Ship the templates

Copy `<plugin-root>/templates/` into `__callbell__/templates/plugin-callbell-sysadmin/`, only what's missing there. Never compare, never overwrite: what the user adapted is theirs.

`<plugin-root>` is **this pack's** folder, two levels above this `SKILL.md`. Don't take the `CALLBELL PLUGIN ROOT` line from the session context; that belongs to the core and points elsewhere. Never type a fixed path; it carries the version number and is wrong after the next update.

The split behind this is the one this pack can actually hold to. **What a plugin ships is general by definition:** it can know nothing about a host it never saw. So:

- general and shipped → `__callbell__/templates/plugin-callbell-sysadmin/`
- shaped by a specific host → `<domain>/templates/`

This is also the path for scripts you copy and adapt: read the general version from the left, write the adapted one to the right. **No plugin ever writes into a domain's template folder.**

## 4. Create the domain

Ask for the name only if you can't read it: on the host it's the hostname (`hostname`). A confirmation is enough.

```
<host>/framework.md   from host-framework.md
<host>/index.md       from host-index.md
```

Rename on copy: the templates carry their target as a suffix so they aren't read as nodes themselves, and must never carry the reserved name while still in the template folder.

**Read the inventory, don't ask for it.** Everything in `index.md` except the purpose sits on the machine, and asking the user for it costs them time on something a command already knows:

```bash
hostname; cat /etc/os-release; ps -p1 -o comm=; uname -r
lscpu | head -20; free -h; df -h /
ip -brief addr; ss -tlnp 2>/dev/null | head -30
command -v docker >/dev/null && docker ps --format '{{.Names}}\t{{.Image}}'
```

All cheap and read-only. None of it searches the filesystem, none of it changes anything.

What you **don't** write into it: keys, passwords, tokens, the contents of `.env` files. The core's data-protection norm holds here unchanged, and the folder may be public one day.

## 5. Set the host identity

One line, and it decides what the hook does in every session after:

```bash
echo "<domain-folder>" > __callbell__/.host-identity
```

**The content is the folder name, not the hostname.** That's the whole reason for this form: if the hostname changes, you rename the folder and this one line with it, and nothing else in the repo.

Three states, and the middle one is easy to miss:

| `.host-identity` | Meaning |
|---|---|
| missing | no server context, nothing server-specific loads |
| present, empty | the user works from their own machine by remote administration; safety layer loads, no domain |
| present, with content | the agent runs on the host; the content is the domain |

**If the user works from their own machine**, create the file empty. The managed hosts' domains still sit in the folder, only none of them is *the* current one, because the user says which host they mean in conversation. The safety layer loads all the same here, because SSH runs the same destructive commands as being on the box.

## 6. Purpose and ruleset (once)

Two things can't be read off the machine, and those are the only ones you ask about:

1. **What this host is for** — one to three sentences, in `framework.md`. Without it the domain is an inventory with no meaning.
2. **What the ruleset doesn't say yet.** Read first, then ask. If the folder's purpose and roles already stand in `AGENTS.md` or `CLAUDE.md`, ask nothing; asking anyway tells the user you didn't read their file.

If the ruleset is missing entirely, create it from `server-agents.md`, with `CLAUDE.md` beside it as the one-line switch `@AGENTS.md`: the same mechanic as the core, so both hosts read the same content without doubling it. Add by **appending, never replacing**, and write only after confirmation: the file belongs to the user.

## 7. Close

Two lines, in the user's language, with names rather than prose:

```
✅ Created: web01/ (framework.md, index.md), __callbell__/.host-identity
❗ Missing: purpose of the host in web01/framework.md
```

What was already there appears nowhere. Close by saying the domain counts as the workspace from the **next** session on, because the hook reads at startup: this session you know it, but the hook hasn't announced it yet.

If there was nothing to do, the close is one line.

**One line more, but only on a fresh machine.** You read the inventory in step 4, so you know what's in front of you. If it shows no admin account beside root, no firewall, none of the standard tools, and no backup timer, then this is an unfinished machine, and you name `/callbell-sysadmin-setup` as the way to bring it fully up.

**Only then.** On a set-up server this pointer doesn't appear: a pointer that always fires is advertising, and it breaks this skill's rule that a run with no findings is one line. When in doubt, leave it out: whoever has a fresh machine notices without you, and whoever has a running one is only unsettled by an offer to provision it from scratch.
