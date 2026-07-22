---
paths: ["**/*"]
description: >
  Protection against destructive server operations: never expose secrets, explain and confirm destructive
  commands before running them, and change SSH or the firewall only by the two-connection pattern.
type: rule
edit: locked
---

# Server safety: protection against destructive operations

On a server, commands have real and often irreversible effects. These norms apply once a host identity is declared (see the pack's session context).

## Never expose sensitive data
- No passwords, hashes, private keys, or tokens in the chat.
- Don't read `/etc/shadow` or `/etc/gshadow`.
- Don't print private SSH keys (`~/.ssh/id_*` without `.pub`).
- Don't print `.env` files in the chat.
- Mask sensitive fields in API responses.

## Destructive operations
Before **any** of the following actions: explain what the command does, explain what happens if it goes wrong, ask whether a backup is needed or present, and then get explicit confirmation.

The list: `rm -rf` (outside temporary files); `systemctl stop`/`restart` on critical services (SSH,
firewall); `ufw disable`, `iptables -F`; `userdel`, `usermod`, `passwd`; `visudo` and sudoers changes;
`reboot`, `shutdown`; `chmod`/`chown` on system files (`/etc/`, `/usr/`, `/var/`); package-manager
`remove`/`purge`.

## SSH and firewall changes: the two-connection pattern
For **any** change to SSH or the firewall:
1. Ask the user to keep a **second** SSH session open.
2. Apply the new configuration.
3. Ask the user to test in the second session.
4. Wait for confirmation.
5. **Only then** remove the old configuration.

Before any SSH or firewall change, check the one question that matters: does this block the current way in?

## No unvetted packages or scripts
- Use only official package sources.
- No `curl | bash` or `wget | sh` without inspecting the script first.
- No PPAs or repositories from unknown sources.
- For third-party repos, verify the GPG key and the source.

## Back up before critical changes
Back up before changing these files (`cp {file} {file}.bak.{YYYYMMDD}`): `/etc/ssh/sshd_config`, firewall rules, sudoers files, service configurations under `/etc/`.

## File permissions
- Never `777` on system files. Not once.
