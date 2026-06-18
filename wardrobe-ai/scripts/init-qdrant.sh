#!/usr/bin/env bash
# Delegates to the Phase 1 face vectors initialization script
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/../database/qdrant/init_users_face_vectors.sh"
