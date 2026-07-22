#!/usr/bin/env bash
# server-checkup: read-only health sweep for a server.
# Gathers system / update / hardening / backup metrics in one pass. Changes NOTHING.
# Run as root (sudo) so sshd -T, ufw, fail2ban-client and borgmatic are readable.
# Distro assumption: Debian/Ubuntu + systemd + UFW. Non-matching blocks are skipped
# with a note; fill the distro equivalent in manually (firewalld/nftables, cron, Plesk).

set -uo pipefail
have() { command -v "$1" >/dev/null 2>&1; }
hr() { printf '\n===== %s =====\n' "$1"; }

hr "SYSTEM"
uptime
run="$(uname -r)"
echo "running kernel : $run"
if ls /boot/vmlinuz-* >/dev/null 2>&1; then
  latest="$(ls -1 /boot/vmlinuz-* | sed 's|/boot/vmlinuz-||' | sort -V | tail -1)"
  echo "latest kernel  : $latest"
  [ "$run" = "$latest" ] && echo "kernel status  : OK (running == latest)" \
                          || echo "kernel status  : STALE (reboot to activate $latest)"
fi
[ -f /var/run/reboot-required ] && echo "reboot-required: YES" || echo "reboot-required: no"
if have timedatectl; then timedatectl | grep -E "Time zone|synchronized|NTP service"; fi
echo "disk / :"; df -h / | tail -1

hr "RESOURCES"
if have free; then
  echo "memory / swap  :"; free -h | grep -E "Mem:|Swap:"
fi
if have ps; then
  echo "top CPU (5):"; ps -eo pcpu,pmem,comm --sort=-pcpu 2>/dev/null | head -6
  echo "top MEM (5):"; ps -eo pmem,pcpu,comm --sort=-pmem 2>/dev/null | head -6
fi

hr "SERVICES (running)"
if have systemctl; then
  systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null \
    | awk '{print "  "$1}'
  echo "(compare against the server's documented services facts; flag unexpected / missing.)"
else
  echo "systemctl not found; list running services with the distro equivalent."
fi

hr "UPDATES"
if have apt; then
  up="$(apt list --upgradable 2>/dev/null | grep -vc '^Listing')"
  # Match the security suffix in the origin field only (pkg/suite-security ...). Matching the word
  # anywhere in the line counts package names like libsecurity-foo and reads higher than it is.
  sec="$(apt list --upgradable 2>/dev/null | grep -c '/[^ ]*-security')"
  echo "upgradable     : $up"
  echo "  of which sec : $sec"
  held="$(apt-mark showhold 2>/dev/null)"
  echo "held packages  : ${held:-none}"
  if [ -f /var/log/unattended-upgrades/unattended-upgrades.log ]; then
    echo "last u-u lines :"
    grep -hE "All upgrades installed|No packages found|Packages that will be upgraded" \
      /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null | tail -3
  fi
else
  echo "apt not found; use distro equivalent (dnf check-update / apk -u list)."
fi

hr "SSH (effective)"
if have sshd; then
  sshd -T 2>/dev/null | grep -E "^(permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries|logingracetime|clientaliveinterval|clientalivecountmax|x11forwarding|allowusers|port) "
else
  echo "sshd not found."
fi

hr "FIREWALL"
if have ufw; then
  ufw status verbose 2>/dev/null | grep -E "Status:|Default:|ALLOW|DENY"
elif have firewall-cmd; then
  echo "firewalld:"; firewall-cmd --list-all 2>/dev/null
elif have nft; then
  echo "nftables ruleset (input):"; nft list ruleset 2>/dev/null | grep -A20 "chain input"
else
  echo "no known firewall tool; check Plesk firewall / provider firewall manually."
fi

hr "FAIL2BAN"
if have fail2ban-client; then
  jails="$(fail2ban-client status 2>/dev/null | sed -n 's/.*Jail list:\t*//p')"
  echo "jails          : $jails"
  echo "dbpurgeage     : $(grep -hE '^dbpurgeage' /etc/fail2ban/fail2ban.local /etc/fail2ban/fail2ban.conf 2>/dev/null | head -1) (effective: .local overrides .conf)"
  for j in $(echo "$jails" | tr ',' ' '); do
    cur="$(fail2ban-client status "$j" 2>/dev/null | sed -n 's/.*Currently banned:\t*//p')"
    tot="$(fail2ban-client status "$j" 2>/dev/null | sed -n 's/.*Total banned:\t*//p')"
    printf '  %-14s banned now=%s total=%s\n' "$j" "${cur:-?}" "${tot:-?}"
  done
else
  echo "fail2ban-client not found."
fi

hr "USERS"
echo "UID-0 accounts :"; awk -F: '$3==0{print "  "$1}' /etc/passwd
echo "sudo/wheel     :"; getent group sudo wheel 2>/dev/null | awk -F: '{print "  "$1": "$4}'
# /etc/shadow is intentionally NOT read (safety rule); empty-password audit only on explicit request.

hr "LOGINS"
if have last; then
  echo "recent logins (10):"; last -n 10 -w 2>/dev/null | head -10
fi
if [ -f /var/log/auth.log ]; then
  echo "failed SSH     : $(grep -c 'Failed password' /var/log/auth.log 2>/dev/null) (in current auth.log)"
  echo "top source IPs :"
  grep 'Failed password' /var/log/auth.log 2>/dev/null \
    | grep -oE 'from [0-9.]+' | awk '{print $2}' | sort | uniq -c | sort -rn | head -5 | sed 's/^/  /'
elif have journalctl; then
  echo "failed SSH     : $(journalctl -u ssh -u sshd --since '7 days ago' 2>/dev/null | grep -c 'Failed password') (journald, 7d)"
fi

hr "UNATTENDED-UPGRADES"
if have systemctl; then
  echo "service        : $(systemctl is-active unattended-upgrades 2>/dev/null)"
fi
grep -hE "Automatic-Reboot" /etc/apt/apt.conf.d/*auto-reboot* /etc/apt/apt.conf.d/*periodic* 2>/dev/null \
  | sed 's/^/auto-reboot    : /' || true

hr "BACKUP (borgmatic)"
if have systemctl && systemctl list-unit-files 2>/dev/null | grep -q borgmatic.timer; then
  echo "timer          : $(systemctl is-active borgmatic.timer 2>/dev/null)"
  systemctl list-timers borgmatic.timer --no-pager 2>/dev/null | grep -E "NEXT|borgmatic" | head -2
  echo "last service   :"
  systemctl status borgmatic.service --no-pager 2>/dev/null | grep -E "Active:|status=" | head -2
fi
if have borgmatic; then
  echo "latest archives:"
  borgmatic list --last 3 2>/dev/null | tail -3
else
  echo "borgmatic not found; non-Docker/non-Borg host? verify backup strategy manually."
fi

hr "DONE"
echo "Read-only sweep complete. Compare each block against the server's documented security/backup baseline."
