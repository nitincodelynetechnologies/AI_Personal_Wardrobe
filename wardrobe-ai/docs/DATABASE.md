# Database — Phase 1 through Phase 4

User Management, Face Authentication, User Profiles, Fashion DNA, Digital Wardrobe, and AI Outfit database initialization.

## Quick Start

```powershell
# 1. Start infrastructure
docker compose up -d

# 2. PostgreSQL — apply all migrations (Phase 1 through Phase 4)
.\scripts\run-postgres-migrations.ps1

# 3. Qdrant — create all vector collections
.\scripts\init-qdrant.ps1

# 4. Start NestJS backend
cd backend
npm install
npm run start:dev
```

Verify: `GET http://localhost:3001/api/health`

## Deliverables

| Artifact | Location |
|----------|----------|
| Users table migration | `database/postgres/migrations/001_create_users_table.up.sql` |
| Phase 2 profile migration | `database/postgres/migrations/002_create_user_profile_tables.up.sql` |
| Phase 3 clothing migration | `database/postgres/migrations/003_create_clothing_items_table.up.sql` |
| Phase 4 outfits migration | `database/postgres/migrations/004_create_outfits_table.up.sql` |
| Migration rollback (Phase 2) | `database/postgres/migrations/002_create_user_profile_tables.down.sql` |
| Migration rollback (Phase 3) | `database/postgres/migrations/003_create_clothing_items_table.down.sql` |
| Migration rollback (Phase 4) | `database/postgres/migrations/004_create_outfits_table.down.sql` |
| Qdrant face init | `database/qdrant/init_users_face_vectors.ps1` |
| Qdrant Phase 2 init | `database/qdrant/init_phase2_collections.ps1` |
| Qdrant Phase 3 init | `database/qdrant/init_phase3_collections.ps1` |
| Schema registry | `backend/src/database/schema.registry.ts` |
| PostgresService | `backend/src/database/postgres.service.ts` |
| QdrantService | `backend/src/database/qdrant.service.ts` |

## Schema Summary

### PostgreSQL Phase 1: `wardrobe.users`

```
id            UUID PRIMARY KEY
email         VARCHAR(255)  — unique, case-insensitive
mobile        VARCHAR(20)     — unique
password_hash VARCHAR(255)    — required
status        ENUM            — pending | active | inactive | suspended | deleted
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ     — auto-updated via trigger
```

### PostgreSQL Phase 2

| Table | Purpose | FK |
|-------|---------|-----|
| `user_profiles` | Physical attributes (gender, age, height, weight, body_type, skin_tone) | `users(id)` CASCADE |
| `user_preferences` | favorite_colors, favorite_brands, budget_range, fashion_style | `users(id)` CASCADE |
| `fashion_dna` | style_score, color_affinity, brand_affinity, lifestyle_score | `users(id)` CASCADE |

### PostgreSQL Phase 3: `wardrobe.clothing_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `user_id` | UUID FK | `users(id)` ON DELETE CASCADE |
| `image_url` | TEXT | MinIO/S3 object path |
| `category` | VARCHAR(50) | Top, Bottom, Footwear, Accessory |
| `sub_category` | VARCHAR(100) | e.g. T-Shirt, Jeans, Sneakers |
| `color_hex` | VARCHAR(7) | Dominant color `#RRGGBB` |
| `season` | VARCHAR(20) | Summer, Winter, Spring, Fall, All |
| `is_favorite` | BOOLEAN | Default `false` |
| `created_at` / `updated_at` | TIMESTAMPTZ | Auto-managed |

Indexes: `user_id`, `(user_id, category)`, partial `(user_id, is_favorite)` where favorite.

### PostgreSQL Phase 4: `wardrobe.outfits`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `user_id` | UUID FK | `users(id)` ON DELETE CASCADE |
| `name` | VARCHAR(100) | Optional label (e.g. "Casual Friday") |
| `top_id` | UUID FK | `clothing_items(id)` ON DELETE SET NULL |
| `bottom_id` | UUID FK | `clothing_items(id)` ON DELETE SET NULL |
| `footwear_id` | UUID FK | `clothing_items(id)` ON DELETE SET NULL |
| `accessory_id` | UUID FK | `clothing_items(id)` ON DELETE SET NULL |
| `style_score` | INTEGER | AI confidence score (0–100) |
| `season_tag` | VARCHAR(20) | Summer, Winter, Spring, Fall, All |
| `is_favorite` | BOOLEAN | Default `false` |
| `created_at` / `updated_at` | TIMESTAMPTZ | Auto-managed |

Constraint: at least one clothing slot (`top_id`, `bottom_id`, `footwear_id`, or `accessory_id`) must be set.

Indexes: `user_id`, `(user_id, season_tag)`, partial favorites, `(user_id, style_score DESC)`, `created_at DESC`.

### Qdrant Phase 1: `users_face_vectors`

```
Vector:    512 dimensions, Cosine distance
Payload:   user_id, name, email, avatar_url
```

### Qdrant Phase 2

| Collection | Dimensions | Purpose |
|------------|------------|---------|
| `fashion_dna_vectors` | 512 | Fashion DNA similarity search |
| `recommendation_vectors` | 512 | Recommendation embeddings |

### Qdrant Phase 3: `clothing_item_vectors`

```
Vector:    512 dimensions, Cosine distance
Payload:   user_id, clothing_id, category, color_hex
Purpose:   Clothing image similarity search and outfit matching
```

## Environment Variables (Phase 2 & Phase 3)

```env
QDRANT_COLLECTION_FASHION_DNA=fashion_dna_vectors
QDRANT_COLLECTION_RECOMMENDATIONS=recommendation_vectors
QDRANT_COLLECTION_CLOTHING_ITEMS=clothing_item_vectors
QDRANT_FASHION_DNA_VECTOR_SIZE=512
QDRANT_RECOMMENDATION_VECTOR_SIZE=512
QDRANT_CLOTHING_ITEM_VECTOR_SIZE=512
```

## Naming Conventions

- Tables and columns: `snake_case`
- Schema namespace: `wardrobe`
- Migration files: `{version}_{description}.{up|down}.sql`
