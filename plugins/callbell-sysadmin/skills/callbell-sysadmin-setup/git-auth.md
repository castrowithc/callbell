---
description: >
  Companion to callbell-sysadmin-setup: set up access to the Git forge for cloning. A scoped token (the
  common case), a deploy key, or an account SSH key, with the GitHub path walked in full.
type: playbook
edit: locked
---

# Setting up Git access

Decide the mechanism before cloning. The three forms below exist on every major forge (GitHub, GitLab, Gitea, Forgejo, Bitbucket); only the name, the menu path, and how finely a token can be scoped differ. The decision is the same everywhere, so make it first and look up the details after.

## Decision matrix

| Mechanism | When | Cost |
|---|---|---|
| **Scoped token** *(the common case)* | several repos; account and/or organization; least privilege; expiry, revocation, and traceability wanted | bearer token (store securely), expires (rotation), HTTPS remote |
| **Deploy key** | the server touches **exactly one** repo, tightest isolation, no expiry | one key per repo; doesn't scale to many |
| **Account SSH key** | a fully trusted admin box with no sensitive or customer repos | no scoping, so it affects the whole account; no expiry |
| **App or bot identity** | automation across a whole organization, short-lived tokens | overkill for a single server |

### What the scoped token is called per forge

The one thing to look up beforehand, because the granularity differs and decides how tightly you can scope:

| Forge | Name | Scoping |
|---|---|---|
| GitHub | Fine-grained personal access token | per repository, per permission |
| GitLab | Project or Group Access Token (Personal Access Token as a further fallback) | per project or group, by scope |
| Gitea / Forgejo | Access token with chosen scopes | by scope; repository-level granularity depends on the version |
| Bitbucket | Repository, Project, or Workspace Access Token | per resource, by scope |

Read the forge's token documentation for the current permission names. They change, and a token with the wrong permission fails only at push, with an error that rarely names the missing one.

### Mapping by server type

- **Simple server** (touches few, clearly bounded repos): one **scoped token** each, limited to exactly the
  needed repos, read and write on contents and nothing else, with expiry (e.g. 90 days). For an especially
  sensitive repo, a **deploy key** instead.
- **Development or organization server** (works across a personal account **and** an organization): **two**
  tokens to keep them separate, one per owner, the organization one with the owner's approval and without
  admin or secrets permissions. Avoid an account SSH key here.

## The common case: scoped token plus credential store

Walked through on GitHub. On another forge the steps are the same in order and meaning; only the menu path and the permission names change.

1. GitHub, Settings, Developer settings, **Fine-grained personal access tokens**, *Generate new token*.
2. **Resource owner:** your personal account (or the organization).
3. **Repository access:** *Only select repositories*, the needed repos (a development server may need
   *All*).
4. **Permissions:** `Contents: Read and write`, `Metadata: Read-only` (Metadata is mandatory).
5. **Expiration:** about 90 days; note a reminder to rotate.
6. Copy the token **once**, store it securely, **never** into the repo, **never** into the chat:

```bash
# credential store in a 600 file (no plaintext in the repo)
git config --global credential.helper 'store --file=/home/<user>/.git-credentials'
chmod 600 /home/<user>/.git-credentials
# On the first push or pull: username = your forge login, password = the token, which then gets stored
```

> Also put the token in a password store, so it's still there after losing the device or server.

> **Careful, the VS Code Remote-SSH effect:** when the server is edited through VS Code, VS Code sets
> `GIT_ASKPASS` and, with an **empty** credential store, automatically supplies an account-wide token
> (instead of the scoped PAT) without asking for a password. So install the scoped PAT **actively** in
> `~/.git-credentials` (the `store` helper beats `GIT_ASKPASS`). Check with
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

Add an entry to the SSH config and clone via `git@github.com-<repo>:<owner>/<repo>.git` (one host alias per key).

Deploy keys live in the repository settings on every forge, and the host alias above is pure SSH config, so it carries over unchanged. One difference is worth checking: some forges reject the same deploy key on two repositories, and that's exactly what forces one key per repo.

## Alternative B: account SSH key (only on a fully trusted box with no customer repos)

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

Test: `ssh -T git@github.com` (expected: `Hi <your-login>! ...`). Clone via `git@github.com:<owner>/<repo>.git`. On another forge use its host throughout; the greeting on a successful test is worded differently, the mechanism is the same.
