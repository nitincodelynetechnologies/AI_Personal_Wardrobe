#!/usr/bin/env bash
# =============================================================================
# AI Personal Wardrobe Platform — Unified Stack Launcher
# Validates Docker, prunes stale networks, builds & starts all 6 services.
# Usage: ./start-platform.sh [--no-init]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$ROOT_DIR/scripts"
NO_INIT=false

for arg in "$@"; do
  case "$arg" in
    --no-init) NO_INIT=true ;;
    -h|--help)
      echo "Usage: ./start-platform.sh [--no-init]"
      echo "  --no-init  Skip PostgreSQL migrations and Qdrant collection init"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

cd "$ROOT_DIR"

echo "==> Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker CLI not found. Install Docker Desktop or Docker Engine."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running. Start Docker and retry."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker Compose v2 is required (docker compose)."
  exit 1
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example..."
  cp .env.example .env
  echo "WARNING: Update secrets in .env before production deployment."
fi

echo "==> Cleaning dangling Docker networks..."
docker network prune -f >/dev/null 2>&1 || true

echo "==> Building and starting the platform stack..."
docker compose up --build -d

echo "==> Waiting for services to stabilize (first run may take several minutes)..."
sleep 45
docker compose ps

if [ "$NO_INIT" = false ]; then
  echo ""
  echo "==> Running PostgreSQL migrations..."
  bash "$SCRIPT_DIR/run-postgres-migrations-docker.sh"

  echo ""
  echo "==> Initializing Qdrant collections..."
  bash "$SCRIPT_DIR/init-qdrant.sh"
fi

# shellcheck disable=SC1091
set -a
source "$ROOT_DIR/.env"
set +a

echo ""
echo "Platform is up."
echo "  Frontend : http://localhost:${FRONTEND_PORT:-3000}"
echo "  API      : http://localhost:${API_PORT:-3001}/api"
echo "  Swagger  : http://localhost:${API_PORT:-3001}/api/docs"
echo "  Face AI  : http://localhost:${FACE_SERVICE_PORT:-8000}/health"
echo "  Stylist  : http://localhost:${STYLIST_SERVICE_PORT:-8001}/health"
echo "  Postgres : localhost:${POSTGRES_PORT:-5432}"
echo "  Qdrant   : http://localhost:${QDRANT_PORT:-6333}"
echo ""
echo "Logs: docker compose logs -f"
echo "Stop: docker compose down"
