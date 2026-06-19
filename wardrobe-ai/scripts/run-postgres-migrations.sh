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

PGHOST="${POSTGRES_HOST:-localhost}"
PGPORT="${POSTGRES_PORT:-5432}"
PGUSER="${POSTGRES_USER:-wardrobe_user}"
PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
PGDATABASE="${POSTGRES_DB:-wardrobe_db}"

export PGPASSWORD

mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.up.sql' | sort)

if [ "${#MIGRATION_FILES[@]}" -eq 0 ]; then
  echo "No migration files found in $MIGRATIONS_DIR"
  exit 1
fi

echo "Running PostgreSQL migrations from $MIGRATIONS_DIR"
echo "  Host: $PGHOST:$PGPORT  Database: $PGDATABASE  User: $PGUSER"
echo ""

for migration_file in "${MIGRATION_FILES[@]}"; do
  echo "Applying $(basename "$migration_file")..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$migration_file"
  echo ""
done

echo "All PostgreSQL migrations complete."
