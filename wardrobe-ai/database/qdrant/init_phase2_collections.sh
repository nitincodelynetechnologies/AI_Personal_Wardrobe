#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

QDRANT_URL="${QDRANT_URL:-http://localhost:6333}"
FASHION_DNA_NAME="${QDRANT_COLLECTION_FASHION_DNA:-fashion_dna_vectors}"
RECOMMENDATION_NAME="${QDRANT_COLLECTION_RECOMMENDATIONS:-recommendation_vectors}"
FASHION_DNA_SIZE="${QDRANT_FASHION_DNA_VECTOR_SIZE:-512}"
RECOMMENDATION_SIZE="${QDRANT_RECOMMENDATION_VECTOR_SIZE:-512}"

init_collection() {
  local name="$1"
  local size="$2"
  shift 2
  local -a indexes=("$@")

  echo "Initializing Qdrant collection: $name at $QDRANT_URL"

  if curl -sf "$QDRANT_URL/collections/$name" > /dev/null 2>&1; then
    echo "  Collection '$name' already exists — skipping creation"
  else
    curl -sf -X PUT "$QDRANT_URL/collections/$name" \
      -H 'Content-Type: application/json' \
      -d "{
        \"vectors\": {
          \"size\": $size,
          \"distance\": \"Cosine\"
        }
      }"
    echo ""
    echo "  Created collection '$name' (${size}-dim, Cosine)"
  fi

  for field in "${indexes[@]}"; do
    if curl -sf -X PUT "$QDRANT_URL/collections/$name/index" \
      -H 'Content-Type: application/json' \
      -d "{\"field_name\": \"$field\", \"field_schema\": \"keyword\"}" > /dev/null 2>&1; then
      echo "  Payload index on '$field' (keyword)"
    else
      echo "  Payload index on '$field' already exists or skipped"
    fi
  done

  echo ""
}

init_collection "$FASHION_DNA_NAME" "$FASHION_DNA_SIZE" user_id fashion_dna_id fashion_style
echo "  Schema reference: $SCRIPT_DIR/collections/fashion_dna_vectors.json"
echo ""

init_collection "$RECOMMENDATION_NAME" "$RECOMMENDATION_SIZE" user_id item_id category source
echo "  Schema reference: $SCRIPT_DIR/collections/recommendation_vectors.json"
echo ""

echo "Qdrant Phase 2 collections initialization complete."
