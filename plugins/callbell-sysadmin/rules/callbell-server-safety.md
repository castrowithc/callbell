---
paths: ["**/*"]
description: >
  Protection against destructive server operations: never reveal secrets, explain and confirm destructive
  commands before running them, and change SSH or the firewall only under the two-connection pattern.
type: rule
edit: locked
---

# Server Safety: Guarding Against Destructive Operations

On a server, commands have real and often irreversible effects. These norms hold whenever a host identity
is declared (see the pack's session context).

## Never reveal sensitive data
- No passwords, hashes, private keys, or tokens in the chat.
- Do not read `/etc/shadow` or `/etc/gshadow`.
- Do not print private SSH keys (`~/.ssh/id_*` without `.pub`).
- Do not output `.env` files in the chat.
- Mask sensitive fields in API responses.

## Destructive operations
Before **any** of the following, explain what the command does, explain what happens if it goes wrong, ask
whether a backup is needed or present, then get explicit confirmation.

The list: `rm -rf` (outside temporary files); `systemctl stop`/`restart` on critical services (SSH,
firewall); `ufw disable`, `iptables -F`; `userdel`, `usermod`, `passwd`; `visudo` and sudoers changes;
`reboot`, `shutdown`; `chmod`/`chown` on system files (`/etc/`, `/usr/`, `/var/`); package-manager
`remove`/`purge`.

## SSH and firewall changes: the two-connection pattern
On **every** change to SSH or the firewall:
1. Ask the user to keep a **second** SSH session open.
2. Apply the new configuration.
3. Ask the user to test in the second session.
4. Wait for confirmation.
5. **Only then** remove the old configuration.

Before any SSH or firewall change, check the one question that matters: does this block the current way in?

## No unverified packages or scripts
- Use official package sources only.
- No `curl | bash` or `wget | sh` without inspecting the script first.
- No PPAs or repositories from unknown sources.
- For third-party repos, verify the GPG key and the source.

## Back up before critical changes
Back up before changing these files (`cp {file} {file}.bak.{YYYYMMDD}`): `/etc/ssh/sshd_config`, firewall
rules, sudoers files, service configs under `/etc/`.

## File permissions
- Never `777` on system files. Not once.
