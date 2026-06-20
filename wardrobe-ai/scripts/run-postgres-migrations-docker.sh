#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$ROOT_DIR/database/postgres/migrations"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

PGUSER="${POSTGRES_USER:-wardrobe_user}"
PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
PGDATABASE="${POSTGRES_DB:-wardrobe_db}"

mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.up.sql' | sort)

if [ "${#MIGRATION_FILES[@]}" -eq 0 ]; then
  echo "No migration files found in $MIGRATIONS_DIR"
  exit 1
fi

echo "Applying migrations via wardrobe-postgres container..."

for migration_file in "${MIGRATION_FILES[@]}"; do
  echo "  -> $(basename "$migration_file")"
  docker exec -i wardrobe-postgres \
    psql -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 \
    < "$migration_file"
done

echo "PostgreSQL migrations complete."
