# <repo-name>

<!-- Template for the AGENTS.md of a server working folder. Copy it to the repo root and adapt the
angle brackets. What such a folder is is nearly the same every time, so a template rather than an
interview. -->

The working folder for administering <host or hosts>. From here you operate, document, and look things up.

## Layout
- One folder per host, named after the host. Everything about a machine lives in its domain: `framework.md`
  says how work is done on it, `index.md` what's on it, everything else grows below.
- `__callbell__/` is the shared center: memory, work trail, zones, templates. It belongs to no host.
- `__callbell__/.host-identity` names the domain a session works in. Empty means: from your own machine by
  remote administration, with no domain set.

Host material belongs in the domain, never in `__callbell__/`.

## Purpose and scope
<!-- What this folder is for and what deliberately doesn't belong. Whether the repo is private; the agent
assumes public otherwise. -->

## Roles
<!-- Who the user is, how independently the agent should act, how verbose and in what tone. -->

## What never belongs here
Credentials in any form: keys, passwords, tokens, `.env` files with content. They live on the host and in
the password store, not in a versioned folder. A private repo is no exception, because visibility can change
and the history remains.
