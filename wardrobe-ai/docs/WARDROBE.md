# Phase 3 — Digital Wardrobe API

Authenticated endpoints for uploading clothing images, persisting metadata, and storing image embeddings in Qdrant.

## Prerequisites

- Phase 1 auth complete (JWT from face login/register)
- Phase 3 database migration applied (`wardrobe.clothing_items`)
- Qdrant `clothing_item_vectors` collection initialized

```powershell
cd wardrobe-ai
.\scripts\run-postgres-migrations.ps1
.\database\qdrant\init_phase3_collections.ps1
```

## Endpoints

All routes require `Authorization: Bearer <jwt_token>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/wardrobe/upload` | Upload clothing image + metadata |
| GET | `/api/wardrobe/items` | List all items for the logged-in user |

**Swagger:** http://localhost:3001/api/docs

## POST /api/wardrobe/upload

`multipart/form-data` with:

| Field | Required | Rules |
|-------|----------|-------|
| `image` | Yes | JPEG, PNG, or WebP; max 5 MB |
| `category` | Yes | `Top`, `Bottom`, `Footwear`, `Accessory` |
| `sub_category` | No | Max 100 chars (e.g. `T-Shirt`) |
| `color_hex` | No | `#RRGGBB` format |
| `season` | No | `Summer`, `Winter`, `Spring`, `Fall`, `All` (default `All`) |

### Upload flow

1. Validate JWT and metadata (DTO)
2. Save image to `./uploads/wardrobe/{user_id}/{uuid}.{ext}`
3. Generate 512-dim embedding (mock by default via `CLOTHING_SERVICE_MOCK=true`)
4. Insert row into `wardrobe.clothing_items`
5. Upsert vector into Qdrant `clothing_item_vectors`

### Example (curl)

```powershell
curl -X POST http://localhost:3001/api/wardrobe/upload `
  -H "Authorization: Bearer YOUR_JWT" `
  -F "image=@shirt.jpg" `
  -F "category=Top" `
  -F "sub_category=T-Shirt" `
  -F "color_hex=#1A2B3C" `
  -F "season=All"
```

### Response

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "image_url": "/uploads/wardrobe/{user_id}/{filename}.jpg",
  "category": "Top",
  "sub_category": "T-Shirt",
  "color_hex": "#1A2B3C",
  "season": "All",
  "is_favorite": false,
  "created_at": "...",
  "updated_at": "..."
}
```

Uploaded images are served at `http://localhost:3001/uploads/wardrobe/...`.

## GET /api/wardrobe/items

Returns all clothing items for the authenticated user, newest first.

```json
{
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "image_url": "/uploads/wardrobe/{user_id}/{filename}.jpg",
      "category": "Top",
      "sub_category": "T-Shirt",
      "color_hex": "#1A2B3C",
      "season": "All",
      "is_favorite": false,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

## Module structure

```
backend/src/wardrobe/
├── wardrobe.module.ts
├── wardrobe.controller.ts
├── wardrobe.service.ts
├── config/multer.config.ts
├── constants/wardrobe.constants.ts
├── dto/
├── interfaces/
└── services/clothing-ai.service.ts
```

## Environment variables

```env
WARDROBE_UPLOAD_DIR=./uploads/wardrobe
WARDROBE_MAX_FILE_SIZE_MB=5
CLOTHING_SERVICE_URL=http://localhost:8001
CLOTHING_SERVICE_MOCK=true
```

Set `CLOTHING_SERVICE_MOCK=false` to call the Python clothing embedding service at `POST /v1/clothing/embed`.

## Qdrant payload

Each upsert stores:

| Field | Description |
|-------|-------------|
| `user_id` | Wardrobe owner UUID |
| `clothing_id` | PostgreSQL `clothing_items.id` |
| `category` | Clothing category |
| `color_hex` | Dominant color (optional) |

Point ID matches `clothing_id` for idempotent upserts.
