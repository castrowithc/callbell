#!/usr/bin/env bash
# server-incident: read-only triage sweep for a host under suspicion.
#
# WHAT THIS IS: the fast pass. It reads known paths and kernel state, never searches the filesystem.
# On a normal host it finishes in seconds and its load is negligible. Everything it collects is either
# volatile (sockets, processes) or small (a handful of config files), in that order, because volatile
# evidence disappears and files do not.
#
# WHAT THIS IS NOT: a filesystem scan. No `find /`, no package verification, no recursive walks. Those
# belong on a snapshot, not on a live host: they cost real I/O, they evict the page cache out from under
# the running services, and a rootkit can lie to every one of them anyway. The skill explains that path.
#
# Changes NOTHING, writes NOTHING to disk. Output goes to stdout and stays in the session.
# Run as root (sudo) so socket owners, cron, and root-owned config are readable.

set -uo pipefail
have() { command -v "$1" >/dev/null 2>&1; }
hr() { printf '\n===== %s =====\n' "$1"; }

# Throttle ourselves rather than trusting the caller to do it. Idle I/O class means we yield to anything
# the host actually needs; the nice value does the same for CPU. Both are best-effort.
have renice && renice -n 19 -p $$ >/dev/null 2>&1
have ionice && ionice -c3 -p $$ >/dev/null 2>&1

# Every block is capped. A block that cannot answer in its budget is reported as such rather than
# allowed to hang: on a host under suspicion, an unexplained pause is itself a problem.
CAP=10
run() { if have timeout; then timeout "$CAP" "$@" 2>/dev/null || echo "  (no result within ${CAP}s)"; else "$@" 2>/dev/null; fi; }

hr "HOST"
echo "hostname       : $(hostname 2>/dev/null)"
echo "kernel         : $(uname -sr 2>/dev/null)"
echo "date (UTC)     : $(date -u '+%Y-%m-%d %H:%M:%S' 2>/dev/null)"
echo "uptime         : $(uptime -p 2>/dev/null || uptime 2>/dev/null)"

# --- Volatile first (RFC 3227 order): these vanish on reboot or when a process exits. ---

hr "NETWORK: listeners"
# The highest-value block per cost on the whole host. A backdoor has to be reachable or has to call out.
if have ss; then
  run ss -tulpn | sed 's/^/  /'
elif have netstat; then
  run netstat -tulpn | sed 's/^/  /'
else
  echo "  neither ss nor netstat found."
fi
echo "  -> diff against the documented service list. An undocumented listener is the finding."

hr "NETWORK: established outbound"
if have ss; then
  run ss -tpn state established | grep -vE '127\.0\.0\.1|\[::1\]' | head -30 | sed 's/^/  /'
fi
echo "  -> a connection no documented service explains outranks almost anything else here."

hr "PROCESS: running"
if have ps; then
  run ps -eo pid,user,pcpu,pmem,etime,comm --sort=-pcpu | head -12 | sed 's/^/  /'
fi

hr "PROCESS: deleted or unusual binaries"
# Reads /proc only, which is kernel memory, not disk. Cheap regardless of filesystem size.
del=0; odd=0
for p in /proc/[0-9]*; do
  exe="$(readlink "$p/exe" 2>/dev/null)" || continue
  case "$exe" in
    *" (deleted)")
      echo "  DELETED  PID ${p#/proc/}: $exe"; del=1 ;;
    /tmp/*|/var/tmp/*|/dev/shm/*|/home/*|/run/*)
      echo "  UNUSUAL  PID ${p#/proc/}: $exe"; odd=1 ;;
  esac
done
[ "$del" = 0 ] && echo "  no process running from a deleted binary"
[ "$odd" = 0 ] && echo "  no process running from a writable or unusual path"

hr "LOGINS: who got in"
# Failed logins are noise on any internet-facing host. Successful ones are the answer.
if have last; then
  echo "recent sessions (15):"
  run last -n 15 -w | head -15 | sed 's/^/  /'
fi
echo "currently logged in:"
run who | sed 's/^/  /'
if [ -f /var/log/auth.log ]; then
  echo "accepted SSH (last 15):"
  run grep -hE 'Accepted (password|publickey)' /var/log/auth.log | tail -15 | sed 's/^/  /'
elif have journalctl; then
  echo "accepted SSH (journald, 14d, last 15):"
  run journalctl -u ssh -u sshd --since '14 days ago' --no-pager | grep -E 'Accepted (password|publickey)' | tail -15 | sed 's/^/  /'
fi

hr "LOGINS: sudo commands"
if [ -f /var/log/auth.log ]; then
  run grep -h 'sudo:.*COMMAND=' /var/log/auth.log | tail -15 | sed 's/^/  /'
elif have journalctl; then
  run journalctl --since '14 days ago' --no-pager | grep -E 'sudo:.*COMMAND=' | tail -15 | sed 's/^/  /'
fi

# --- Persistent next: small, known paths. Still cheap, since none of this searches. ---

hr "ACCESS: privileged accounts"
echo "UID-0 accounts :"; awk -F: '$3==0{print "  "$1}' /etc/passwd
echo "sudo/wheel     :"; getent group sudo wheel 2>/dev/null | awk -F: '{print "  "$1": "$4}'
echo "login shells   :"; awk -F: '$7 !~ /(nologin|false|sync)$/ {print "  "$1" ("$3") "$7}' /etc/passwd 2>/dev/null
# /etc/shadow is intentionally NOT read (safety rule).

hr "ACCESS: authorized_keys"
# Fingerprints and comments only, never key material. Service-user keys are the common quiet backdoor,
# so the glob covers more than the obvious home directories.
found=0
for f in /root/.ssh/authorized_keys /root/.ssh/authorized_keys2 \
         /home/*/.ssh/authorized_keys /home/*/.ssh/authorized_keys2 \
         /etc/ssh/authorized_keys.d/* ; do
  [ -f "$f" ] || continue
  found=1
  echo "  $f  (mtime $(stat -c %y "$f" 2>/dev/null | cut -d. -f1), owner $(stat -c %U "$f" 2>/dev/null))"
  if have ssh-keygen; then ssh-keygen -l -f "$f" 2>/dev/null | sed 's/^/      /'
  else awk '{print "      "$1" ... "$NF}' "$f" 2>/dev/null; fi
done
[ "$found" = 0 ] && echo "  none found in the usual locations"
echo "  -> every key must map to a person or a documented automation. One that does not is the finding."
if have sshd; then
  echo "sshd effective auth settings:"
  run sshd -T | grep -E "^(permitrootlogin|passwordauthentication|pubkeyauthentication|authorizedkeysfile|authorizedkeyscommand|allowusers|allowgroups|port) " | sed 's/^/  /'
fi

hr "PERSISTENCE: cron"
if have crontab; then
  while IFS=: read -r u _; do
    out="$(crontab -l -u "$u" 2>/dev/null | grep -vE '^\s*(#|$)')"
    [ -n "$out" ] && { echo "  user $u:"; echo "$out" | sed 's/^/      /'; }
  done < /etc/passwd
fi
for d in /etc/crontab /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly; do
  [ -e "$d" ] || continue
  echo "  $d:"; ls -lt --time-style=long-iso "$d" 2>/dev/null | tail -n +2 | head -10 | sed 's/^/      /'
done
have atq && { echo "  at jobs:"; run atq | sed 's/^/      /'; }

hr "PERSISTENCE: systemd units and timers, newest first"
if have systemctl; then
  echo "unit files in /etc/systemd/system, by mtime:"
  ls -lt --time-style=long-iso /etc/systemd/system/*.service /etc/systemd/system/*.timer 2>/dev/null \
    | head -15 | sed 's/^/  /'
  echo "active timers:"
  run systemctl list-timers --all --no-pager --no-legend | head -15 | sed 's/^/  /'
  echo "user-level units (per-user persistence hides here):"
  ls -lt --time-style=long-iso /home/*/.config/systemd/user/* /root/.config/systemd/user/* 2>/dev/null \
    | head -10 | sed 's/^/  /'
  echo "  -> sort is by modification date on purpose: a hostile unit looks like every other unit,"
  echo "     it is only newer."
fi

hr "PERSISTENCE: shell init and preload"
for f in /etc/profile /etc/bash.bashrc /etc/environment /root/.bashrc /root/.profile \
         /home/*/.bashrc /home/*/.profile /home/*/.bash_profile; do
  [ -f "$f" ] || continue
  echo "  $f  (mtime $(stat -c %y "$f" 2>/dev/null | cut -d. -f1))"
done
echo "  /etc/profile.d:"; ls -lt --time-style=long-iso /etc/profile.d 2>/dev/null | tail -n +2 | head -10 | sed 's/^/      /'
[ -f /etc/rc.local ] && echo "  /etc/rc.local present (mtime $(stat -c %y /etc/rc.local 2>/dev/null | cut -d. -f1))"
if [ -f /etc/ld.so.preload ]; then
  echo "  /etc/ld.so.preload EXISTS, contents:"; sed 's/^/      /' /etc/ld.so.preload
  echo "      -> this file is absent on a stock system. Treat its presence as a finding until explained."
else
  echo "  /etc/ld.so.preload absent (normal)"
fi

hr "DOCKER"
if have docker; then
  echo "running:"; run docker ps --format '  {{.Names}}  {{.Image}}  {{.Status}}  {{.Ports}}'
  echo "images by age:"; run docker images --format '  {{.Repository}}:{{.Tag}}  {{.CreatedSince}}' | head -15
  echo "privileged or host-mounted:"
  for c in $(docker ps -q 2>/dev/null); do
    n="$(docker inspect -f '{{.Name}}' "$c" 2>/dev/null)"
    priv="$(docker inspect -f '{{.HostConfig.Privileged}}' "$c" 2>/dev/null)"
    binds="$(docker inspect -f '{{range .HostConfig.Binds}}{{.}} {{end}}' "$c" 2>/dev/null)"
    case "$priv$binds" in
      *true*|*/:*|*docker.sock*) echo "  $n  privileged=$priv  binds=$binds" ;;
    esac
  done
  echo "  -> diff against the documented stack. An image nobody pulled is the finding."
else
  echo "  docker not found; skip."
fi

hr "DONE"
echo "Triage complete. Nothing was written to this host and no filesystem search was performed."
echo "Compare each block against the host's documented facts where they exist, and against"
echo "normal-for-this-kind-of-host where they do not. Say which of the two you used."
