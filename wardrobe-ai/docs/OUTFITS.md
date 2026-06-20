# Phase 4 — AI Outfit Generation & Recommendations API

Authenticated endpoints for generating outfit combinations from a user's wardrobe, persisting them in PostgreSQL, and returning fully populated clothing item details.

## Prerequisites

- Phase 1 auth complete (JWT from face login/register)
- Phase 3 wardrobe populated (`wardrobe.clothing_items` with at least one **Top**, **Bottom**, and **Footwear**)
- Phase 4 migration applied (`wardrobe.outfits`)

```powershell
cd wardrobe-ai
.\scripts\run-postgres-migrations.ps1
```

## Endpoints

All routes require `Authorization: Bearer <jwt_token>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/outfits/generate` | Generate and save a new AI outfit |
| GET | `/api/outfits` | List all saved outfits for the logged-in user |

**Swagger:** http://localhost:3001/api/docs

## POST /api/outfits/generate

Optional JSON body:

| Field | Required | Rules |
|-------|----------|-------|
| `season` | No | `Summer`, `Winter`, `Spring`, `Fall`, `All` (default `All`) |
| `name` | No | Max 100 chars (e.g. `Weekend Casual`) |

### Generation flow

1. Validate JWT
2. Fetch all `clothing_items` for the user
3. Ensure at least 1 Top, 1 Bottom, and 1 Footwear exist — otherwise **400**:
   `"Not enough items in wardrobe to generate an outfit."`
4. **Mock AI** selects:
   - 1 Top, 1 Bottom, 1 Footwear (optional Accessory if available)
   - Prefers items matching the requested `season` (or `All`)
   - Prefers complementary `color_hex` for bottoms vs tops
   - Random `style_score` between **70** and **99**
5. Insert row into `wardrobe.outfits`
6. Return populated outfit with nested clothing item objects (including `image_url`)

### Example (curl)

```powershell
curl -X POST http://localhost:3001/api/outfits/generate `
  -H "Authorization: Bearer YOUR_JWT" `
  -H "Content-Type: application/json" `
  -d '{"season":"All","name":"Smart Casual"}'
```

### Response

```json
{
  "outfit": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Smart Casual",
    "top_id": "uuid",
    "bottom_id": "uuid",
    "footwear_id": "uuid",
    "accessory_id": null,
    "style_score": 87,
    "season_tag": "All",
    "is_favorite": false,
    "created_at": "...",
    "updated_at": "...",
    "top": {
      "id": "uuid",
      "image_url": "/uploads/wardrobe/{user_id}/top.jpg",
      "category": "Top",
      "sub_category": "T-Shirt",
      "color_hex": "#1A2B3C",
      "season": "All"
    },
    "bottom": { "...": "..." },
    "footwear": { "...": "..." },
    "accessory": null
  }
}
```

## GET /api/outfits

Returns all saved outfits for the authenticated user, ordered by newest first. Each outfit includes nested `top`, `bottom`, `footwear`, and `accessory` objects via SQL `LEFT JOIN` on `wardrobe.clothing_items`.

### Example

```powershell
curl http://localhost:3001/api/outfits `
  -H "Authorization: Bearer YOUR_JWT"
```

### Response

```json
{
  "outfits": [
    {
      "id": "uuid",
      "style_score": 91,
      "season_tag": "Summer",
      "top": { "image_url": "/uploads/wardrobe/...", "category": "Top" },
      "bottom": { "...": "..." },
      "footwear": { "...": "..." },
      "accessory": null
    }
  ]
}
```

## Module structure

```
backend/src/outfits/
├── outfits.module.ts
├── outfits.controller.ts
├── outfits.service.ts
├── constants/outfits.constants.ts
├── dto/
│   ├── generate-outfit.dto.ts
│   └── outfit-response.dto.ts
├── interfaces/outfit.interface.ts
└── services/
    └── outfit-generator.service.ts   # Mock AI selection logic
```

## Error codes

| Status | Condition |
|--------|-----------|
| 400 | Wardrobe missing Top, Bottom, or Footwear |
| 401 | Missing or invalid JWT |
| 503 | PostgreSQL unavailable |
