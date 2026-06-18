#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Update passwords in .env before production use."
fi

echo "Starting Wardrobe AI infrastructure..."
docker compose up -d

echo "Waiting for services to become healthy..."
sleep 10

docker compose ps

echo ""
echo "Initializing Qdrant collections..."
bash "$SCRIPT_DIR/init-qdrant.sh"

echo ""
echo "✅ All services are running."
echo "   PostgreSQL : localhost:${POSTGRES_PORT:-5432}"
echo "   Redis      : localhost:${REDIS_PORT:-6379}"
echo "   Qdrant     : localhost:${QDRANT_PORT:-6333}"
echo "   MinIO API  : localhost:${MINIO_PORT:-9000}"
echo "   MinIO UI   : localhost:${MINIO_CONSOLE_PORT:-9001}"
