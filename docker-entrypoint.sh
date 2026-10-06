#!/usr/bin/env bash
set -euo pipefail
mkdir -p /data /host-monocode
chmod 700 /data /host-monocode
host_cli=(node /opt/monocode-host/monocode-host.mjs)
# Preserve PATH initialized by the user's login shell so mounted npm/CLI installs are found.
login_path="$(bash -lc 'printf %s "$PATH"' 2>/dev/null || true)"
if [[ -n "$login_path" ]]; then export PATH="$login_path:$PATH"; fi
port_ready() { node -e "const s=require('node:net').connect(3774,'127.0.0.1').once('connect',()=>{s.end();process.exit(0)}).once('error',()=>process.exit(1))"; }
if ! port_ready >/dev/null 2>&1; then
  rm -f /host-monocode/running.json
  node scripts/import-desktop-sessions.mjs >>/host-monocode/import.log 2>&1 || echo "MonoPad: desktop session import skipped" >&2
  "${host_cli[@]}" serve --data-dir /host-monocode --port 3774 >>/host-monocode/host.log 2>&1 &
  for _ in $(seq 1 150); do port_ready >/dev/null 2>&1 && break; sleep 0.1; done
  port_ready >/dev/null
fi
mkdir -p /data
if [[ ! -s /data/access-token ]]; then
  node scripts/token.mjs > /data/access-token
  chmod 600 /data/access-token
fi
export MONOPAD_ACCESS_TOKEN="$(tr -d '\r\n' < /data/access-token)"
if [[ ! -s /data/monocode-device.json ]]; then
  "${host_cli[@]}" pair --name "MonoPad Docker" --json --data-dir /host-monocode --port 3774 > /data/monocode-device.json
  chmod 600 /data/monocode-device.json
fi
export MONOCODE_DEVICE_TOKEN="$(node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('/data/monocode-device.json'));process.stdout.write(d.token)")"
exec node server/index.js
