#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
docker compose down
if command -v tailscale >/dev/null 2>&1; then tailscale serve --https=443 8787 off 2>/dev/null || true; fi
