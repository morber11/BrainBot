#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_DIR"

echo "[build-and-deploy] Using compose file: $COMPOSE_FILE"

echo "[build-and-deploy] Stopping existing compose project (if any)..."

docker compose down --remove-orphans || true

echo "[build-and-deploy] Building Docker image..."
docker compose build

echo "[build-and-deploy] Running database migrations..."
docker compose run --rm --no-deps brainbot npm run db-run-migrations

echo "[build-and-deploy] Starting containers..."
docker compose up -d "$@"

echo "[build-and-deploy] Done. To follow logs run: docker compose logs -f"

exit 0
