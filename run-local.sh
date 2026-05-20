#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_PORT="${WEB_PORT:-8081}"
API_PORT="${API_PORT:-4000}"
HOST="${HOST:-127.0.0.1}"
API_URL="${EXPO_PUBLIC_API_URL:-http://${HOST}:${API_PORT}}"
BACKEND_PID=""
WEB_PID=""

cleanup() {
  if [[ -n "${WEB_PID}" ]] && kill -0 "${WEB_PID}" 2>/dev/null; then
    kill "${WEB_PID}" 2>/dev/null || true
  fi
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

cd "${ROOT_DIR}"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ ! -d server/node_modules ]]; then
  npm --prefix server install
fi

if [[ -f server/.env || -n "${DATABASE_URL:-}" ]]; then
  echo "Starting API on http://${HOST}:${API_PORT}"
  PORT="${API_PORT}" npm --prefix server run dev &
  BACKEND_PID="$!"
else
  echo "Skipping API: create server/.env from server/.env.example to enable backend/auth."
fi

echo "Building web preview with EXPO_PUBLIC_API_URL=${API_URL}"
EXPO_PUBLIC_API_URL="${API_URL}" npx expo export --platform web

echo "Starting web preview on http://${HOST}:${WEB_PORT}"
python3 -m http.server "${WEB_PORT}" --bind "${HOST}" -d dist &
WEB_PID="$!"

echo
echo "Open: http://${HOST}:${WEB_PORT}"
if [[ -n "${BACKEND_PID}" ]]; then
  echo "API:  http://${HOST}:${API_PORT}"
fi
echo "Press Ctrl+C to stop."

wait
