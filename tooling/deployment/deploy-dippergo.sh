#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# DipperGo Production Deployment Script (172.245.26.40)
# Deploys Reactive Resume / DipperGo monorepo to the production cloud VPS.
# ==============================================================================

HOST="${DIPPERGO_HOST:-172.245.26.40}"
USER="${DIPPERGO_USER:-root}"
PASS="${DIPPERGO_PASS:-9n4GthfAUkud}"
REMOTE_DIR="${DIPPERGO_DIR:-/root/reactive-resume}"
PORT="${DIPPERGO_PORT:-3000}"
APP_URL="${DIPPERGO_APP_URL:-https://dippergo.com}"

BUILD_HOST="${LAN_BUILD_HOST:-192.168.1.27}"
BUILD_USER="${LAN_BUILD_USER:-shawn}"
BUILD_PASS="${LAN_BUILD_PASS:-password}"

SKIP_CHECKS=false
SYNC_ONLY=false
BUILD_REMOTE=false
SHOW_LOGS=false

for arg in "$@"; do
  case "$arg" in
    --skip-checks)  SKIP_CHECKS=true ;;
    --sync-only)    SYNC_ONLY=true ;;
    --build-remote) BUILD_REMOTE=true ;;
    --logs)         SHOW_LOGS=true ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --skip-checks   Skip local boundary and typecheck validation"
      echo "  --sync-only     Transfer files without restarting containers"
      echo "  --build-remote  Build Docker image on remote VPS rather than streaming pre-built image"
      echo "  --logs          Tail container logs on target server"
      echo "  -h, --help      Show this help message"
      echo ""
      echo "Environment variables:"
      echo "  DIPPERGO_HOST      Target server IP/hostname (default: 172.245.26.40)"
      echo "  DIPPERGO_USER      SSH username (default: root)"
      echo "  DIPPERGO_PASS      SSH password (default: 9n4GthfAUkud)"
      echo "  DIPPERGO_DIR       Remote installation directory (default: /root/reactive-resume)"
      echo "  DIPPERGO_APP_URL   Canonical platform URL (default: https://dippergo.com)"
      echo "  LAN_BUILD_HOST     LAN Docker build host for prebuilt images (default: 192.168.1.27)"
      exit 0
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${ROOT_DIR}"

run_ssh() {
  if command -v sshpass >/dev/null 2>&1; then
    sshpass -p "${PASS}" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 "${USER}@${HOST}" "$@"
  else
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 "${USER}@${HOST}" "$@"
  fi
}

if [ "${SHOW_LOGS}" = true ]; then
  echo "Tailing container logs on ${USER}@${HOST}..."
  run_ssh "cd '${REMOTE_DIR}' && docker compose logs -f --tail 100"
  exit 0
fi

echo "======================================================================="
echo "  DipperGo Cloud Deployment -> ${USER}@${HOST} (${APP_URL})"
echo "======================================================================="

echo ""
echo "=== [1/6] Checking connectivity to ${USER}@${HOST} ==="
if ! run_ssh "true"; then
  echo "Error: Cannot connect to ${USER}@${HOST}. Check IP, SSH service, and credentials." >&2
  exit 1
fi
echo "✓ SSH connection established"

if [ "${SKIP_CHECKS}" = false ]; then
  echo ""
  echo "=== [2/6] Running local validations (boundaries & typechecks) ==="
  pnpm exec turbo boundaries
  pnpm --filter web typecheck
  pnpm --filter server typecheck
  echo "✓ Validations passed"
else
  echo ""
  echo "=== [2/6] Skipping local validations (--skip-checks) ==="
fi

echo ""
echo "=== [3/6] Verifying remote server prerequisites ==="
run_ssh "
set -e
# Install Docker and Docker Compose plugin if missing
if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo 'Installing Docker and Compose plugin...'
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl ca-certificates
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker.service
fi

# Ensure adequate swapfile exists (min 4GB for safe operation)
TOTAL_SWAP=\$(free -m | awk '/Swap:/ {print \$2}')
if [ \"\${TOTAL_SWAP:-0}\" -lt 2000 ] && [ ! -f /swapfile_extra ]; then
  echo 'Configuring 4GB swap space...'
  fallocate -l 4G /swapfile_extra || dd if=/dev/zero of=/swapfile_extra bs=1M count=4096
  chmod 600 /swapfile_extra
  mkswap /swapfile_extra
  swapon /swapfile_extra
  grep -q '/swapfile_extra' /etc/fstab || echo '/swapfile_extra none swap sw 0 0' >> /etc/fstab
fi
mkdir -p '${REMOTE_DIR}'
"
echo "✓ Remote host prerequisites verified (Docker, Compose, Swap)"

echo ""
echo "=== [4/6] Synchronizing repository files to ${HOST}:${REMOTE_DIR} ==="
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

tar "${EXCLUDES[@]}" -cf - . | run_ssh "tar -xf - -C '${REMOTE_DIR}'"
echo "✓ Source files synchronized"

echo ""
echo "=== [5/6] Preparing remote environment and Docker configuration ==="
run_ssh "
set -e
cd '${REMOTE_DIR}'

# Generate production .env if not already present
if [ ! -f .env ]; then
  echo 'Generating initial production .env...'
  AUTH_SECRET=\$(openssl rand -hex 32)
  ENCRYPTION_SECRET=\$(openssl rand -hex 32)
  cat <<ENV_EOF > .env
# Application URLs
APP_URL=${APP_URL}

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres

# Storage (SeaweedFS S3 inside Docker network)
STORAGE_BACKEND=s3
S3_ENDPOINT=http://seaweedfs:8333
S3_BUCKET=reactive-resume
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=seaweedfs
S3_SECRET_ACCESS_KEY=seaweedfs

# Redis
REDIS_URL=redis://redis:6379

# Authentication & Security
AUTH_SECRET=\${AUTH_SECRET}
ENCRYPTION_SECRET=\${ENCRYPTION_SECRET}
STRICT_SCHEMA_CHECK=false

# Platform Administrator Credentials
ADMIN_USERNAME=shawn
ADMIN_PASSWORD=!Password1
ENV_EOF
  echo '✓ Created new production .env'
else
  # Ensure APP_URL is correctly set in existing .env
  if grep -q '^APP_URL=' .env; then
    sed -i 's|^APP_URL=.*|APP_URL=${APP_URL}|' .env
  else
    echo 'APP_URL=${APP_URL}' >> .env
  fi
  echo '✓ Preserved existing production .env'
fi

# Ensure compose.override.yml maps port 80 (for Cloudflare) and port 3000 (direct)
cat <<COMPOSE_OVERRIDE > compose.override.yml
services:
  reactive_resume:
    image: reactive_resume-reactive_resume:latest
    ports:
      - \"80:3000\"
      - \"3000:3000\"
COMPOSE_OVERRIDE
echo '✓ Configured compose.override.yml (ports 80 & 3000 mapped)'
"

if [ "${SYNC_ONLY}" = true ]; then
  echo "=== Sync complete (--sync-only). Skipping container deployment. ==="
  exit 0
fi

# Check if image exists on target
IMAGE_EXISTS=$(run_ssh "docker images -q reactive_resume-reactive_resume:latest 2>/dev/null || true")

if [ "${BUILD_REMOTE}" = true ]; then
  echo ""
  echo "=== Building Docker image directly on remote VPS (${HOST}) ==="
  run_ssh "cd '${REMOTE_DIR}' && docker compose build reactive_resume"
elif [ -z "${IMAGE_EXISTS}" ]; then
  echo ""
  echo "=== Image not found on remote. Transferring pre-built image from ${BUILD_HOST}... ==="
  if command -v sshpass >/dev/null 2>&1 && sshpass -p "${BUILD_PASS}" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 "${BUILD_USER}@${BUILD_HOST}" "true" 2>/dev/null; then
    echo "Piping pre-built image from ${BUILD_USER}@${BUILD_HOST} to ${USER}@${HOST}..."
    sshpass -p "${BUILD_PASS}" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${BUILD_USER}@${BUILD_HOST}" "docker save reactive_resume-reactive_resume:latest | gzip -1" | \
      run_ssh "gzip -d | docker load"
    echo "✓ Pre-built image loaded on remote"
  else
    echo "Notice: LAN build host not accessible. Building directly on remote VPS..."
    run_ssh "cd '${REMOTE_DIR}' && docker compose build reactive_resume"
  fi
else
  echo "✓ Using existing loaded image reactive_resume-reactive_resume:latest"
fi

echo ""
echo "=== [6/6] Starting application stack on ${HOST} ==="
run_ssh "cd '${REMOTE_DIR}' && docker compose up -d --remove-orphans reactive_resume"

echo ""
echo "=== Verifying health at http://${HOST}:${PORT}/api/health ==="
RETRIES=20
HEALTH_URL="http://${HOST}:${PORT}/api/health"

for i in $(seq 1 "${RETRIES}"); do
  HEALTH_JSON=$(curl -s -m 4 "${HEALTH_URL}" || true)
  if echo "${HEALTH_JSON}" | grep -q '"status":"healthy"'; then
    echo "✓ Local healthcheck passed!"
    echo "${HEALTH_JSON}"
    break
  fi
  echo "  Waiting for container initialization (attempt ${i}/${RETRIES})..."
  sleep 3
done

echo ""
echo "=== Testing public domain endpoint ${APP_URL}/api/health ==="
DOMAIN_HEALTH=$(curl -s -m 5 "${APP_URL}/api/health" || true)
if echo "${DOMAIN_HEALTH}" | grep -q '"status":"healthy"'; then
  echo "✓ Public domain check passed via Cloudflare!"
else
  echo "Notice: Public domain check returned: ${DOMAIN_HEALTH:-No response yet (Cloudflare propagation / DNS routing may take a minute)}"
fi

echo ""
echo "======================================================================="
echo "🚀 DipperGo production deployment complete!"
echo "   Public Domain: ${APP_URL}"
echo "   Direct Access: http://${HOST}:3000"
echo "   Direct HTTP:   http://${HOST}"
echo "======================================================================="

