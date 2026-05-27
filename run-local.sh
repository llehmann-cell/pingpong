#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_PORT="${WEB_PORT:-8081}"
API_PORT="${API_PORT:-4000}"
HOST="${HOST:-127.0.0.1}"
API_URL="${EXPO_PUBLIC_API_URL:-http://${HOST}:${API_PORT}}"
WEB_MODE="${WEB_MODE:-static}"
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

if [[ -f server/.env || -n "${DATABASE_URL:-}" ]]; then
  if [[ ! -d server/node_modules ]]; then
    npm --prefix server install
  fi
  echo "Starting API on http://${HOST}:${API_PORT}"
  PORT="${API_PORT}" npm --prefix server run dev &
  BACKEND_PID="$!"
else
  echo "Skipping API: create server/.env from server/.env.example to enable backend/auth."
fi

if [[ "${WEB_MODE}" == "expo" ]]; then
  if [[ ! -d node_modules ]]; then
    npm install
  fi
  echo "Building Expo web preview with EXPO_PUBLIC_API_URL=${API_URL}"
  EXPO_PUBLIC_API_URL="${API_URL}" npx expo export --platform web
  echo "Starting Expo web preview on http://${HOST}:${WEB_PORT}"
  python3 -m http.server "${WEB_PORT}" --bind "${HOST}" -d dist &
else
  echo "Starting branded static preview on http://${HOST}:${WEB_PORT}"
  python3 -m http.server "${WEB_PORT}" --bind "${HOST}" -d "${ROOT_DIR}" &
fi
WEB_PID="$!"

echo
echo "Open: http://${HOST}:${WEB_PORT}"
if [[ -n "${BACKEND_PID}" ]]; then
  echo "API:  http://${HOST}:${API_PORT}"
fi
echo "Press Ctrl+C to stop."

URL="http://${HOST}:${WEB_PORT}"
until curl -s -o /dev/null "${URL}"; do sleep 0.2; done
if [[ "${OSTYPE}" == "darwin"* ]]; then
  open -a "Google Chrome" "${URL}" 2>/dev/null || open "${URL}"
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome "${URL}" &
elif command -v chromium >/dev/null 2>&1; then
  chromium "${URL}" &
else
  xdg-open "${URL}" 2>/dev/null || true
fi

wait
