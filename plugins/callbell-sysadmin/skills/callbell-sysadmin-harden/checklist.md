---
description: >
  Companion to callbell-sysadmin-harden: a checklist for new and existing servers (sign-off and re-check).
  Record the state per server in its domain.
type: playbook
edit: locked
---

# Hardening checklist

> For new servers and regular re-checks. Commands in parentheses are examples for Debian/Ubuntu with
> systemd; on other distributions use the counterpart. Record the state per server in its domain.

## SSH

- [ ] PermitRootLogin = no
- [ ] PasswordAuthentication = no
- [ ] PubkeyAuthentication = yes
- [ ] MaxAuthTries <= 3
- [ ] LoginGraceTime <= 30s
- [ ] ClientAliveInterval = 300
- [ ] X11Forwarding = no
- [ ] SSH port changed (or the deliberate choice recorded)
- [ ] Only the needed users have SSH access (`AllowUsers`, no stale entries)

## Firewall

- [ ] Server firewall active (UFW: `ufw status`; firewalld; a panel's firewall)
- [ ] Only the needed ports open
- [ ] Provider firewall active (e.g. Hetzner, IONOS) and set up
- [ ] No direct external access to internal services

## fail2ban

- [ ] Jail `sshd` active (maxretry = 3, bantime >= 1h)
- [ ] Jail `recidive` active with `bantime = -1` (permanent) and `findtime = 1w`
- [ ] `dbpurgeage = 365d` set in `/etc/fail2ban/fail2ban.local`
- [ ] The server's own public IP in `ignoreip` (so you don't lock yourself out)
- [ ] Service-specific jails active (panel, Caddy and Docker applications, and so on)

## System hardening

- [ ] Automatic security updates active (`systemctl status unattended-upgrades` / `dnf-automatic`)
- [ ] Automatic reboot deliberately decided (optional on uncritical servers: time after the backup window;
      otherwise manual)
- [ ] NTP active (`timedatectl`)
- [ ] Log rotation set up
- [ ] No unnecessary services running (`systemctl list-units --type=service --state=running`)

## Users and permissions

- [ ] No root login possible
- [ ] Admin user set up
- [ ] sudoers rules minimal and recorded
- [ ] Monitoring user without sudo (if present)

## Backup

- [ ] Backup timer active (e.g. `systemctl status borgmatic.timer`)
- [ ] Last backup successful
- [ ] Passphrase and keys stored in the password store
- [ ] Notifications set up and working
- [ ] Restore test performed (record the date)

## Other

- [ ] SSH key for external services (e.g. GitHub) present and passphrase-protected
- [ ] No credentials in Git repos
- [ ] Docker ports bound to 127.0.0.1 (if Docker is installed)
- [ ] On Docker servers: the stack conventions from skill `callbell-sysadmin-deploy` followed
