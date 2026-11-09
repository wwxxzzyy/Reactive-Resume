#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# DipperGo / Reactive Resume Host Deployment Script
# Deploys local monorepo changes to the self-hosted Docker server.
# ==============================================================================

HOST="${RESUME_HOST:-192.168.1.27}"
USER="${RESUME_USER:-shawn}"
PASS="${RESUME_PASS:-password}"
REMOTE_DIR="${RESUME_REMOTE_DIR:-/home/shawn/reactive-resume}"
PORT="${RESUME_PORT:-3000}"

SKIP_CHECKS=false
SYNC_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --skip-checks) SKIP_CHECKS=true ;;
    --sync-only)   SYNC_ONLY=true ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --skip-checks  Skip local boundary and typecheck validation"
      echo "  --sync-only    Transfer files without triggering remote docker build"
      echo "  -h, --help     Show this help message"
      echo ""
      echo "Environment overrides:"
      echo "  RESUME_HOST        Target server IP/hostname (default: 192.168.1.27)"
      echo "  RESUME_USER        SSH username (default: shawn)"
      echo "  RESUME_PASS        SSH password (default: password)"
      echo "  RESUME_REMOTE_DIR  Remote repository directory (default: /home/shawn/reactive-resume)"
      echo "  RESUME_PORT        Application port (default: 3000)"
      exit 0
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${ROOT_DIR}"

run_ssh() {
  if command -v sshpass >/dev/null 2>&1; then
    sshpass -p "${PASS}" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=8 "${USER}@${HOST}" "$@"
  else
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=8 "${USER}@${HOST}" "$@"
  fi
}

echo "=== [1/5] Checking connectivity to ${USER}@${HOST} ==="
if ! run_ssh "true"; then
  echo "Error: Cannot connect to ${USER}@${HOST}. Check IP, SSH service, and credentials." >&2
  exit 1
fi
echo "✓ SSH connection established"

if [ "${SKIP_CHECKS}" = false ]; then
  echo "=== [2/5] Running local boundary and typecheck validations ==="
  pnpm exec turbo boundaries
  pnpm --filter web typecheck
  pnpm --filter server typecheck
  echo "✓ Validations passed"
else
  echo "=== [2/5] Skipping local validations (--skip-checks) ==="
fi

echo "=== [3/5] Synchronizing repository changes to ${HOST}:${REMOTE_DIR} ==="
# Exclude node_modules, build outputs, production data, local envs, and internal agent logs
EXCLUDES=(
  --exclude="node_modules"
  --exclude=".git"
  --exclude="data"
  --exclude=".env"
  --exclude=".env.local"
  --exclude=".turbo"
  --exclude=".agents"
  --exclude="dist"
  --exclude="dist-prerender"
  --exclude=".cache"
)

# Stream archive directly through SSH tar unpack
tar "${EXCLUDES[@]}" -cf - . | run_ssh "mkdir -p '${REMOTE_DIR}' && tar -xf - -C '${REMOTE_DIR}'"
echo "✓ Source files synchronized"

if [ "${SYNC_ONLY}" = true ]; then
  echo "=== Sync complete (--sync-only). Skipping Docker rebuild. ==="
  exit 0
fi

echo "=== [4/5] Building Docker image on host ==="
run_ssh "cd '${REMOTE_DIR}' && docker compose build reactive_resume"

echo "=== [5/5] Recreating and starting container ==="
run_ssh "cd '${REMOTE_DIR}' && docker compose up -d --force-recreate --no-deps reactive_resume"

echo "=== Verifying service health at http://${HOST}:${PORT}/api/health ==="
RETRIES=15
HEALTH_URL="http://${HOST}:${PORT}/api/health"

for i in $(seq 1 "${RETRIES}"); do
  HEALTH_JSON=$(curl -s -m 3 "${HEALTH_URL}" || true)
  if echo "${HEALTH_JSON}" | grep -q '"status":"healthy"'; then
    echo "✓ Healthcheck passed!"
    echo "${HEALTH_JSON}"
    echo ""
    echo "======================================================================="
    echo "🚀 Deployment succeeded! App is live at: http://${HOST}:${PORT}"
    echo "======================================================================="
    exit 0
  fi
  echo "  Waiting for service startup (attempt ${i}/${RETRIES})..."
  sleep 3
done

echo "Warning: Service did not report healthy within timeout. Checking container logs:"
run_ssh "docker logs --tail 30 reactive_resume-reactive_resume-1"
exit 1

