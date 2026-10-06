#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -s var/docker/access-token ]]; then
  echo "O token ainda não existe. Inicie o MonoPad primeiro com ./start.sh ou ./start-lan.sh." >&2
  exit 1
fi
base_url="${1:-${MONOPAD_URL:-}}"
if [[ -z "$base_url" ]]; then
  lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  base_url="http://${lan_ip:-127.0.0.1}:8787"
fi
if node -e "require.resolve('qrcode-terminal')" >/dev/null 2>&1; then
  node scripts/pair.mjs "$base_url"
elif command -v docker >/dev/null 2>&1 && [[ "$(docker compose ps -q monopad 2>/dev/null)" != "" ]]; then
  MONOPAD_PAIR_TOKEN="$(tr -d '\r\n' < var/docker/access-token)"
  docker compose exec -T -e MONOPAD_ACCESS_TOKEN="$MONOPAD_PAIR_TOKEN" monopad node scripts/pair.mjs "$base_url"
else
  echo "Dependência de QR não encontrada. Inicie o Docker ou execute npm install." >&2
  exit 1
fi
