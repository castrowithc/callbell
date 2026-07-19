---
description: >
  Resource for callbell-server-harden: a check checklist for new and existing servers (sign-off / audit).
  Document the status per server in that server's security context.
type: skill
edit: locked
---

# Hardening Checklist

> For new servers and periodic checks. Commands in parentheses are Debian/Ubuntu + systemd examples; on
> other distros use the equivalent. Document the status per server in that server's security context.

## SSH
- [ ] PermitRootLogin = no
- [ ] PasswordAuthentication = no
- [ ] PubkeyAuthentication = yes
- [ ] MaxAuthTries <= 3
- [ ] LoginGraceTime <= 30s
- [ ] ClientAliveInterval = 300
- [ ] X11Forwarding = no
- [ ] SSH port changed (or the deliberate choice documented)
- [ ] Only the necessary users have SSH access (`AllowUsers`, no orphaned entries)

## Firewall
- [ ] Server firewall active (UFW: `ufw status`; firewalld; a panel's own firewall)
- [ ] Only the needed ports open
- [ ] Provider firewall active (e.g. Hetzner, IONOS) and configured
- [ ] No direct access to internal services from outside

## fail2ban
- [ ] sshd jail active (maxretry = 3, bantime >= 1h)
- [ ] recidive jail active with `bantime = -1` (permanent) and `findtime = 1w`
- [ ] `dbpurgeage = 365d` set in `/etc/fail2ban/fail2ban.local`
- [ ] The server's own public IP in `ignoreip` (protection against locking yourself out)
- [ ] Service-specific jails active (panel, Caddy/Docker apps, etc.)

## System hardening
- [ ] Automatic security updates active (`systemctl status unattended-upgrades` / `dnf-automatic`)
- [ ] Auto-reboot decided deliberately (opt-in non-critical servers: time after the backup window; else manual)
- [ ] NTP active (`timedatectl`)
- [ ] Log rotation configured
- [ ] No unnecessary services running (`systemctl list-units --type=service --state=running`)

## Users and permissions
- [ ] No root login possible
- [ ] Admin user configured
- [ ] Sudoers rules minimal and documented
- [ ] Monitoring user without sudo (if present)

## Backup
- [ ] Backup timer active (e.g. `systemctl status borgmatic.timer`)
- [ ] Last backup succeeded
- [ ] Passphrase and key stored in a secrets vault (e.g. a password manager)
- [ ] Notifications configured and working
- [ ] Restore test performed (record the date)

## Other
- [ ] SSH keys for external services (e.g. GitHub) present and passphrase-protected
- [ ] No credentials in Git repos
- [ ] Docker ports bound to 127.0.0.1 (if Docker is installed)
- [ ] On Docker servers: stack conventions from skill `callbell-server-deploy` followed
