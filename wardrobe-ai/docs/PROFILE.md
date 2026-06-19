# Phase 2 — Profile & Fashion DNA API

Authenticated endpoints for user demographics, style preferences, and AI-generated Fashion DNA.

## Prerequisites

- Phase 1 auth complete (JWT from face login/register)
- Phase 2 database migration applied
- Qdrant `fashion_dna_vectors` collection initialized

```powershell
cd wardrobe-ai
.\scripts\run-postgres-migrations.ps1
.\database\qdrant\init_phase2_collections.ps1
```

## Endpoints

All routes require `Authorization: Bearer <jwt_token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profile` | Combined profile + preferences |
| PUT | `/api/profile` | Update demographic profile |
| PUT | `/api/profile/preferences` | Update preferences, recalculate Fashion DNA |
| GET | `/api/fashion-dna` | Fetch current Fashion DNA profile |

**Swagger:** http://localhost:3001/api/docs

## GET /api/profile

Returns profile and preferences (either may be `null` if not yet created).

```json
{
  "profile": null,
  "preferences": {
    "id": "uuid",
    "user_id": "uuid",
    "favorite_colors": ["navy"],
    "favorite_brands": ["Zara"],
    "budget_range": "mid",
    "fashion_style": "minimalist",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

## PUT /api/profile

Upserts demographic attributes into `wardrobe.user_profiles`.

```json
{
  "gender": "female",
  "age": 28,
  "height": 165.5,
  "weight": 62.0,
  "body_type": "athletic",
  "skin_tone": "medium"
}
```

## PUT /api/profile/preferences

Updates preferences and triggers mock Fashion DNA recalculation:

1. Upsert `wardrobe.user_preferences`
2. Compute mock scores (`style_score`, `lifestyle_score`, affinities)
3. Upsert `wardrobe.fashion_dna`
4. Upsert 512-dim vector into Qdrant `fashion_dna_vectors`

```json
{
  "favorite_colors": ["navy", "beige"],
  "favorite_brands": ["Zara"],
  "budget_range": "mid",
  "fashion_style": "minimalist"
}
```

## GET /api/fashion-dna

Returns the persisted Fashion DNA row (404 if preferences were never updated).

## Example (curl)

```bash
TOKEN="<jwt_from_face_login>"

curl http://localhost:3001/api/profile \
  -H "Authorization: Bearer $TOKEN"

curl -X PUT http://localhost:3001/api/profile/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"favorite_colors":["navy"],"favorite_brands":["Zara"],"budget_range":"mid","fashion_style":"minimalist"}'

curl http://localhost:3001/api/fashion-dna \
  -H "Authorization: Bearer $TOKEN"
```

## Module Structure

```
backend/src/
├── auth/
│   guards/jwt-auth.guard.ts
│   strategies/jwt.strategy.ts
│   decorators/current-user.decorator.ts
├── profile/
│   profile.module.ts
│   profile.controller.ts
│   profile.service.ts
│   dto/
└── fashion-dna/
    fashion-dna.module.ts
    fashion-dna.controller.ts
    fashion-dna.service.ts
    utils/fashion-dna.mock.ts
```

## Tests

```bash
cd backend
npm test
```

Covers preference merge logic and Fashion DNA mock calculation.
