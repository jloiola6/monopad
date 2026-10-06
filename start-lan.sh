#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export MONOPAD_UID="$(id -u)"
export MONOPAD_GID="$(id -g)"
mkdir -p var/docker "$HOME/.monocode-host"
chmod 700 var/docker "$HOME/.monocode-host"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker não está instalado." >&2
  exit 1
fi
docker compose -f compose.yaml -f compose.lan.yaml up -d --build
for _ in $(seq 1 40); do
  [[ -s var/docker/access-token ]] && [[ "$(docker inspect -f '{{.State.Running}}' monopad 2>/dev/null || true)" == "true" ]] && break
  sleep 0.5
done
if [[ ! -s var/docker/access-token ]]; then
  echo "MonoPad não concluiu a inicialização:" >&2
  docker compose logs --no-color --tail=80 >&2
  exit 1
fi
lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo
echo "MonoPad disponível na rede de casa:"
echo "  http://${lan_ip:-IP-DO-PC}:8787"
echo
echo "Chave de acesso do painel:"
cat var/docker/access-token
echo
echo "Use somente no Wi-Fi confiável. Não encaminhe a porta 8787 no roteador."
echo
echo "QR Code de login (aponte a câmera do iPad):"
./pair.sh "http://${lan_ip:-127.0.0.1}:8787"
