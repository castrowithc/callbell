---
description: >
  Resource for callbell-sysadmin:setup: set up GitHub access for the repo clone. A fine-grained PAT
  (default), a deploy key, or an account SSH key.
type: skill
edit: locked
---

# Set Up Git Auth

Before cloning, pick the right auth mechanism for GitHub.

## Decision matrix

| Mechanism | When to choose | Trade-off |
|---|---|---|
| **Fine-grained PAT** *(default)* | several repos; account and/or org; least privilege per permission; expiry, revocation, and org audit wanted | bearer token (store it safely), expires (rotation), HTTPS remote |
| **Deploy key** | the server touches **exactly one** repo, maximum isolation, no expiry | one key per repo; does not scale to many repos |
| **Account SSH key** | a fully trusted admin box with no sensitive or customer repos | no scoping, so an account-wide blast radius; no expiry |
| **GitHub App** *(future)* | org-wide automation at scale, short-lived tokens | overkill for current needs |

### Mapping by server type
- **Simple server** (touches a few clearly scoped repos): one **fine-grained PAT** each, limited exactly to
  the needed repos, permissions `Contents: Read and write` plus `Metadata: Read-only`, with an expiry (e.g.
  90 days). For one especially sensitive repo, use a **deploy key** instead.
- **Dev / org server** (works across a personal account **and** an organization): **two** PATs to keep them
  apart: (a) the personal account, (b) the org with org-owner approval (no admin/secrets permissions). Avoid
  an account SSH key here.

## Default: fine-grained PAT plus credential-store
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
# On the first push/pull: username = your GitHub login, password = the PAT, which then gets stored
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
`git@github.com:<owner>/<repo>.git`.
