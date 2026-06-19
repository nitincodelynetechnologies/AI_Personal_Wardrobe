#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash "$SCRIPT_DIR/../database/qdrant/init_users_face_vectors.sh"
bash "$SCRIPT_DIR/../database/qdrant/init_phase2_collections.sh"
bash "$SCRIPT_DIR/../database/qdrant/init_phase3_collections.sh"
