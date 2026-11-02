#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Tunnel Showcase Runner (Constitution Principle IV)
# Routes local development port 5173 to public showcase hostname

PORT="${PORT:-5173}"
HOSTNAME="${HOSTNAME:-vite.sharukhtech.com}"

echo "=================================================="
echo "⚡ Starting Cloudflare Edge Tunnel Ingress"
echo "Target origin: http://localhost:${PORT}"
echo "Showcase host: https://${HOSTNAME}"
echo "=================================================="

if command -v cloudflared >/dev/null 2>&1; then
  exec cloudflared tunnel --url "http://localhost:${PORT}"
else
  echo "⚠️ 'cloudflared' not found in PATH."
  echo "To expose this app via Cloudflare Tunnel, install cloudflared or run via your authorized origin daemon."
  echo "Starting local Vite dev server directly on port ${PORT}..."
  exec npm run dev
fi
