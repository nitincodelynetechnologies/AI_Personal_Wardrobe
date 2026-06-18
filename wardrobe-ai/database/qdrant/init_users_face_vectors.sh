#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COLLECTION_FILE="$SCRIPT_DIR/collections/users_face_vectors.json"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

QDRANT_URL="${QDRANT_URL:-http://localhost:6333}"
COLLECTION_NAME="${QDRANT_COLLECTION_FACES:-users_face_vectors}"
VECTOR_SIZE=512

echo "Initializing Qdrant collection: $COLLECTION_NAME at $QDRANT_URL"

if curl -sf "$QDRANT_URL/collections/$COLLECTION_NAME" > /dev/null 2>&1; then
  echo "  Collection '$COLLECTION_NAME' already exists — skipping creation"
else
  curl -sf -X PUT "$QDRANT_URL/collections/$COLLECTION_NAME" \
    -H 'Content-Type: application/json' \
    -d "{
      \"vectors\": {
        \"size\": $VECTOR_SIZE,
        \"distance\": \"Cosine\"
      }
    }"
  echo ""
  echo "  Created collection '$COLLECTION_NAME' (${VECTOR_SIZE}-dim, Cosine)"
fi

create_payload_index() {
  local field="$1"
  local schema="${2:-keyword}"

  if curl -sf -X PUT "$QDRANT_URL/collections/$COLLECTION_NAME/index" \
    -H 'Content-Type: application/json' \
    -d "{\"field_name\": \"$field\", \"field_schema\": \"$schema\"}" > /dev/null 2>&1; then
    echo "  Payload index on '$field' ($schema)"
  else
    echo "  Payload index on '$field' already exists or skipped"
  fi
}

create_payload_index "user_id" "keyword"
create_payload_index "email" "keyword"
create_payload_index "name" "keyword"

echo ""
echo "Collection schema reference: $COLLECTION_FILE"
echo "Qdrant face vectors initialization complete."
