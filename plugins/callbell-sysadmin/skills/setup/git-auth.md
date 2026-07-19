---
description: >
  Resource for callbell-sysadmin:setup: set up git forge access for the repo clone. A scoped token
  (default), a deploy key, or an account SSH key, with the GitHub procedure worked through in full.
type: playbook
edit: locked
---

# Set Up Git Auth

Before cloning, pick the auth mechanism. The three shapes below exist on every major forge (GitHub,
GitLab, Gitea, Forgejo, Bitbucket); what differs is the name, the menu path, and how finely a token can be
scoped. The decision is the same everywhere, so make it first and look up the specifics second.

## Decision matrix

| Mechanism | When to choose | Trade-off |
|---|---|---|
| **Scoped token** *(default)* | several repos; account and/or org; least privilege; expiry, revocation, and audit wanted | bearer token (store it safely), expires (rotation), HTTPS remote |
| **Deploy key** | the server touches **exactly one** repo, maximum isolation, no expiry | one key per repo; does not scale to many repos |
| **Account SSH key** | a fully trusted admin box with no sensitive or customer repos | no scoping, so an account-wide blast radius; no expiry |
| **App / bot identity** | org-wide automation at scale, short-lived tokens | overkill for a single server |

### What the scoped token is called, per forge

The one thing to check before you start, because the granularity differs and it decides how tightly you
can scope:

| Forge | Name | Scoping |
|---|---|---|
| GitHub | Fine-grained personal access token | per repository, per permission |
| GitLab | Project or group access token (personal access token as the wider fallback) | per project or group, by scope |
| Gitea / Forgejo | Access token with selected scopes | by scope; repository-level granularity varies by version |
| Bitbucket | Repository, project, or workspace access token | per resource, by scope |

Read the forge's own token documentation for the current permission names. They change, and a token
created with the wrong permission fails at push time with an error that rarely names the missing one.

### Mapping by server type
- **Simple server** (touches a few clearly scoped repos): one **scoped token** each, limited exactly to the
  needed repos, read-write on contents and nothing else, with an expiry (e.g. 90 days). For one especially
  sensitive repo, use a **deploy key** instead.
- **Dev / org server** (works across a personal account **and** an organization): **two** tokens to keep
  them apart, one per owner, the org one with owner approval and no admin or secrets permissions. Avoid an
  account SSH key here.

## Default: scoped token plus credential-store

Worked through on GitHub. On another forge the steps are the same in order and meaning; only the menu path
and the permission names change.

1. GitHub, Settings, Developer settings, **Fine-grained personal access tokens**, *Generate new token*.
2. **Resource owner:** your personal account (or the org).
3. **Repository access:** *Only select repositories*, the needed repos (a dev server may need *All*).
4. **Permissions:** `Contents: Read and write`, `Metadata: Read-only` (Metadata is mandatory).
5. **Expiration:** e.g. 90 days; note a rotation reminder.
6. Copy the token **once**, store it safely, **never** in the repo, **never** in the chat:

```bash
# credential-store to a 600 file (no plaintext in the repo)
git config --global credential.helper 'store --file=/home/<user>/.git-credentials'
chmod 600 /home/<user>/.git-credentials
# On the first push/pull: username = your forge login, password = the token, which then gets stored
```

> Also keep the token in a secrets vault (e.g. a password manager) for recovery after device or server loss.

> **Watch out, the VS Code Remote-SSH effect:** if the server is edited over VS Code, VS Code sets
> `GIT_ASKPASS` and, with an **empty** credential-store, automatically supplies an account-wide token
> (instead of the scoped PAT), with no password prompt. So deposit the scoped PAT **actively** in
> `~/.git-credentials` (the `store` helper wins over `GIT_ASKPASS`). Check with
> `env | grep -E 'ASKPASS|VSCODE_GIT'`.

Clone and connection test:
```bash
git clone https://github.com/<owner>/<repo>.git ~/repos/<repo>
git ls-remote https://github.com/<owner>/<repo>.git >/dev/null && echo "OK"
```

## Alternative A: deploy key (exactly one repo)
```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy_<repo> -C "<host> deploy <repo>"
cat ~/.ssh/deploy_<repo>.pub   # GitHub: Repo, Settings, Deploy keys, Add (Allow write access)
```
Add an SSH config entry and clone via `git@github.com-<repo>:<owner>/<repo>.git` (a host alias per key).

Every forge has deploy keys under the repository's own settings, and the host-alias trick above is plain
SSH config, so it carries over unchanged. Note the one difference worth checking: some forges refuse to
register the same deploy key on two repositories, which is what forces one key per repo.

## Alternative B: account SSH key (only a fully trusted box with no customer repos)
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_<host> -C "<host> github key"
cat ~/.ssh/github_<host>.pub   # GitHub: Settings, SSH and GPG keys, New SSH key
```
`~/.ssh/config`:
```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_<host>
    AddKeysToAgent yes
```
Test: `ssh -T git@github.com` (expected: `Hi <your-login>! ...`). Clone via
`git@github.com:<owner>/<repo>.git`. On another forge, substitute its host throughout; the greeting on a
successful test differs in wording but the mechanism is identical.
