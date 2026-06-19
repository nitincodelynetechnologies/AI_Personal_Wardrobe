#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source <(grep -v '^\s*#' "$ENV_FILE" | sed 's/\r$//')
  set +a
fi

QDRANT_URL="${QDRANT_URL:-http://${QDRANT_HOST:-localhost}:${QDRANT_PORT:-6333}}"
if [[ "$QDRANT_URL" == *'${'* ]]; then
  QDRANT_URL="http://${QDRANT_HOST:-localhost}:${QDRANT_PORT:-6333}"
fi

COLLECTION_NAME="${QDRANT_COLLECTION_CLOTHING_ITEMS:-clothing_item_vectors}"
VECTOR_SIZE="${QDRANT_CLOTHING_ITEM_VECTOR_SIZE:-512}"

echo "Initializing Qdrant collection: $COLLECTION_NAME at $QDRANT_URL"

if curl -sf "$QDRANT_URL/collections/$COLLECTION_NAME" > /dev/null; then
  echo "  Collection '$COLLECTION_NAME' already exists - skipping creation"
else
  curl -sf -X PUT "$QDRANT_URL/collections/$COLLECTION_NAME" \
    -H 'Content-Type: application/json' \
    -d "{\"vectors\":{\"size\":$VECTOR_SIZE,\"distance\":\"Cosine\"}}"
  echo "  Created collection $COLLECTION_NAME (${VECTOR_SIZE}-dim, Cosine)"
fi

for field in user_id clothing_id category color_hex; do
  curl -sf -X PUT "$QDRANT_URL/collections/$COLLECTION_NAME/index" \
    -H 'Content-Type: application/json' \
    -d "{\"field_name\":\"$field\",\"field_schema\":\"keyword\"}" \
    > /dev/null || true
  echo "  Payload index on '$field' (keyword)"
done

echo ""
echo "Schema reference: $SCRIPT_DIR/collections/clothing_item_vectors.json"
echo "Qdrant Phase 3 collections initialization complete."
