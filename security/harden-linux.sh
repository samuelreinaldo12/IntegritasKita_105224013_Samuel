#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo on the target Ubuntu/Debian VM." >&2
  exit 1
fi

if ! grep -Eq '^[[:space:]]*Include[[:space:]]+/etc/ssh/sshd_config\.d/\*\.conf' /etc/ssh/sshd_config; then
  echo "sshd_config does not include /etc/ssh/sshd_config.d/*.conf; review the target before applying." >&2
  exit 1
fi

authorized_keys_found=false
for key_file in /root/.ssh/authorized_keys /home/*/.ssh/authorized_keys; do
  if [[ -s "$key_file" ]]; then
    authorized_keys_found=true
    break
  fi
done

if [[ "$authorized_keys_found" != true ]]; then
  echo "No authorized_keys file found. Install and test a key before disabling password login." >&2
  exit 1
fi

install -d -o root -g root -m 0755 /etc/ssh/sshd_config.d
install -o root -g root -m 0600 \
  "$(dirname "$0")/sshd_config.d/00-sec-0.2.conf" \
  /etc/ssh/sshd_config.d/00-sec-0.2.conf

sshd -t
effective="$(sshd -T)"
grep -qx 'passwordauthentication no' <<<"$effective"
grep -qx 'kbdinteractiveauthentication no' <<<"$effective"
grep -qx 'permitrootlogin no' <<<"$effective"
grep -qx 'pubkeyauthentication yes' <<<"$effective"
grep -qx 'authenticationmethods publickey' <<<"$effective"
systemctl reload ssh
printf '%s\n' "$effective" | grep -E '^(passwordauthentication|kbdinteractiveauthentication|permitrootlogin|pubkeyauthentication|authenticationmethods) '
