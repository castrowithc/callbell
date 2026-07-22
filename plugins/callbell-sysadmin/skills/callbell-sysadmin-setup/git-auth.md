---
description: >
  Begleitdatei zu callbell-sysadmin-setup: den Zugang zur Git-Forge für das Klonen einrichten. Ein
  eingegrenzter Token (Normalfall), ein Deploy-Key oder ein Konto-SSH-Schlüssel, mit dem Weg über GitHub
  vollständig durchgespielt.
type: playbook
edit: locked
---

# Git-Zugang einrichten

Vor dem Klonen entscheidest du den Mechanismus. Die drei Formen unten gibt es auf jeder größeren Forge
(GitHub, GitLab, Gitea, Forgejo, Bitbucket); anders sind nur der Name, der Menüpfad und wie fein ein Token
eingegrenzt werden kann. Die Entscheidung ist überall dieselbe, triff sie also zuerst und schlag die
Einzelheiten danach nach.

## Entscheidungsmatrix

| Mechanismus | Wann | Preis |
|---|---|---|
| **Eingegrenzter Token** *(Normalfall)* | mehrere Repos; Konto und/oder Organisation; möglichst wenig Rechte; Ablauf, Widerruf und Nachvollziehbarkeit erwünscht | Bearer-Token (sicher verwahren), läuft ab (Rotation), HTTPS-Remote |
| **Deploy-Key** | der Server berührt **genau ein** Repo, größte Abschottung, kein Ablauf | ein Schlüssel je Repo; skaliert nicht auf viele |
| **Konto-SSH-Schlüssel** | eine vollständig vertrauenswürdige Admin-Kiste ohne sensible oder Kunden-Repos | keine Eingrenzung, also Wirkung auf das ganze Konto; kein Ablauf |
| **App- oder Bot-Identität** | Automatisierung über eine ganze Organisation, kurzlebige Tokens | für einen einzelnen Server überdimensioniert |

### Wie der eingegrenzte Token je Forge heißt

Das Einzige, was du vorher nachsehen solltest, weil die Feinheit sich unterscheidet und darüber entscheidet,
wie eng du eingrenzen kannst:

| Forge | Name | Eingrenzung |
|---|---|---|
| GitHub | Fine-grained personal access token | je Repository, je Berechtigung |
| GitLab | Project- oder Group-Access-Token (Personal Access Token als weiterer Rückfall) | je Projekt oder Gruppe, nach Scope |
| Gitea / Forgejo | Access-Token mit gewählten Scopes | nach Scope; die Feinheit auf Repository-Ebene hängt von der Version ab |
| Bitbucket | Repository-, Project- oder Workspace-Access-Token | je Ressource, nach Scope |

Lies die Token-Dokumentation der Forge für die aktuellen Namen der Berechtigungen. Sie ändern sich, und ein
Token mit der falschen Berechtigung scheitert erst beim Push, mit einer Fehlermeldung, die die fehlende
selten benennt.

### Zuordnung nach Servertyp

- **Einfacher Server** (berührt wenige, klar umrissene Repos): je ein **eingegrenzter Token**, genau auf die
  nötigen Repos begrenzt, lesend und schreibend auf Inhalte und sonst nichts, mit Ablauf (etwa 90 Tage). Für
  ein besonders sensibles Repo stattdessen einen **Deploy-Key**.
- **Entwicklungs- oder Organisationsserver** (arbeitet über ein persönliches Konto **und** eine
  Organisation): **zwei** Tokens, um beides getrennt zu halten, einer je Eigentümer, der für die
  Organisation mit Freigabe des Inhabers und ohne Admin- oder Secrets-Berechtigungen. Einen
  Konto-SSH-Schlüssel hier vermeiden.

## Normalfall: eingegrenzter Token plus credential-store

Durchgespielt an GitHub. Auf einer anderen Forge sind die Schritte in Reihenfolge und Bedeutung dieselben;
nur der Menüpfad und die Namen der Berechtigungen ändern sich.

1. GitHub, Settings, Developer settings, **Fine-grained personal access tokens**, *Generate new token*.
2. **Resource owner:** dein persönliches Konto (oder die Organisation).
3. **Repository access:** *Only select repositories*, die nötigen Repos (ein Entwicklungsserver braucht
   womöglich *All*).
4. **Permissions:** `Contents: Read and write`, `Metadata: Read-only` (Metadata ist Pflicht).
5. **Expiration:** etwa 90 Tage; eine Erinnerung zur Rotation notieren.
6. Den Token **einmal** kopieren, sicher verwahren, **nie** ins Repo, **nie** in den Chat:

```bash
# credential-store in eine 600er Datei (kein Klartext im Repo)
git config --global credential.helper 'store --file=/home/<benutzer>/.git-credentials'
chmod 600 /home/<benutzer>/.git-credentials
# Beim ersten Push oder Pull: Benutzername = dein Login der Forge, Passwort = der Token, der dann
# gespeichert wird
```

> Leg den Token zusätzlich in einen Passwortspeicher, damit er nach Verlust von Gerät oder Server wieder da
> ist.

> **Achtung, der Effekt von VS Code Remote-SSH:** wird der Server über VS Code bearbeitet, setzt VS Code
> `GIT_ASKPASS` und liefert bei **leerem** credential-store automatisch einen kontoweiten Token (statt des
> eingegrenzten PAT), ohne nach einem Passwort zu fragen. Hinterleg den eingegrenzten PAT deshalb **aktiv**
> in `~/.git-credentials` (der `store`-Helper schlägt `GIT_ASKPASS`). Prüfen mit
> `env | grep -E 'ASKPASS|VSCODE_GIT'`.

Klonen und Verbindungstest:

```bash
git clone https://github.com/<eigentuemer>/<repo>.git ~/repos/<repo>
git ls-remote https://github.com/<eigentuemer>/<repo>.git >/dev/null && echo "OK"
```

## Alternative A: Deploy-Key (genau ein Repo)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy_<repo> -C "<host> deploy <repo>"
cat ~/.ssh/deploy_<repo>.pub   # GitHub: Repo, Settings, Deploy keys, Add (Allow write access)
```

Einen Eintrag in der SSH-Konfiguration ergänzen und über
`git@github.com-<repo>:<eigentuemer>/<repo>.git` klonen (ein Host-Alias je Schlüssel).

Deploy-Keys liegen auf jeder Forge in den Einstellungen des Repositorys, und der Host-Alias oben ist reine
SSH-Konfiguration, überträgt sich also unverändert. Ein Unterschied lohnt die Nachfrage: manche Forges
lehnen denselben Deploy-Key auf zwei Repositorys ab, und genau das erzwingt einen Schlüssel je Repo.

## Alternative B: Konto-SSH-Schlüssel (nur auf einer voll vertrauenswürdigen Kiste ohne Kunden-Repos)

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

Test: `ssh -T git@github.com` (erwartet: `Hi <dein-login>! ...`). Klonen über
`git@github.com:<eigentuemer>/<repo>.git`. Auf einer anderen Forge durchgehend deren Host einsetzen; die
Begrüßung bei erfolgreichem Test ist anders formuliert, der Mechanismus derselbe.
