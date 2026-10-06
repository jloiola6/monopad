#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export MONOPAD_UID="$(id -u)"
export MONOPAD_GID="$(id -g)"
mkdir -p var/docker
chmod 700 var/docker
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker não está instalado." >&2
  exit 1
fi
mkdir -p "$HOME/.monocode-host"
chmod 700 "$HOME/.monocode-host"
docker compose up -d --build
for _ in $(seq 1 40); do
  [[ -s var/docker/access-token ]] && [[ "$(docker inspect -f '{{.State.Running}}' monopad 2>/dev/null || true)" == "true" ]] && break
  sleep 0.5
done
if [[ ! -s var/docker/access-token ]]; then
  echo "MonoPad não concluiu a inicialização:" >&2
  docker compose logs --no-color --tail=80 >&2
  exit 1
fi
if command -v tailscale >/dev/null 2>&1; then
  tailscale serve --bg 8787 >/dev/null
  echo
  tailscale serve status
  pair_url="$(tailscale serve status 2>/dev/null | grep -Eo 'https://[^[:space:]]+' | head -1 || true)"
  if [[ -z "$pair_url" ]]; then
    lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
    pair_url="http://${lan_ip:-127.0.0.1}:8787"
  fi
  echo
  echo "QR Code de login (aponte a câmera do iPad):"
  ./pair.sh "$pair_url"
  echo "Abra a URL HTTPS acima no Safari do iPad. O login também pode ser feito pelo QR Code."
else
  lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  pair_url="http://${lan_ip:-127.0.0.1}:8787"
  echo "MonoPad iniciou em http://127.0.0.1:8787"
  echo "Tailscale não foi encontrado. Instale-o para acesso privado pelo iPad."
  echo "Chave para acesso local: $(cat var/docker/access-token)"
  echo
  echo "QR Code de login (aponte a câmera do iPad):"
  ./pair.sh "$pair_url"
fi
