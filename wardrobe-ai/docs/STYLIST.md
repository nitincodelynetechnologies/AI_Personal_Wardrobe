# Phase 5 — AI Stylist Microservice

Python FastAPI service for real clothing image analysis and smart outfit recommendations.

## Prerequisites

- Phase 3 wardrobe API (clothing uploads)
- Phase 4 outfits API (NestJS gateway)
- Optional: Phase 2 Fashion DNA profile for richer recommendations

## Service location

```
ai-services/stylist-service/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── analysis_service.py
│   ├── recommendation_service.py
│   └── schemas/
├── requirements.txt
├── Dockerfile
└── tests/
```

Default port: **8001**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/v1/clothing/analyze` | Category, dominant color, 512-dim embedding |
| POST | `/v1/outfits/recommend` | Best Top/Bottom/Footwear combination |

## POST /v1/clothing/analyze

Multipart image upload (`file`, `image`, or `images` field).

### Response

```json
{
  "category": "Top",
  "color_hex": "#1A2B3C",
  "embedding": [0.012, -0.034, "... 512 floats"]
}
```

### MVP logic

1. **Category** — MobileNetV2 ImageNet logits mapped to wardrobe categories, with aspect-ratio fallback
2. **Color** — K-Means clustering on sampled RGB pixels
3. **Embedding** — MobileNetV2 backbone features projected to 512 dimensions and L2-normalized

## POST /v1/outfits/recommend

JSON body:

| Field | Required | Description |
|-------|----------|-------------|
| `season` | No | `Summer`, `Winter`, `Spring`, `Fall`, `All` (default `All`) |
| `fashion_dna` | No | Style scores and color/brand affinity maps |
| `items` | Yes | Wardrobe items with `id`, `category`, `color_hex`, `season` |

### Response

```json
{
  "top_id": "uuid",
  "bottom_id": "uuid",
  "footwear_id": "uuid",
  "style_score": 92
}
```

### MVP logic

- Filters items by season compatibility
- Scores all Top × Bottom × Footwear combinations
- Weights season match, complementary colors, and Fashion DNA color affinity
- Maps normalized score to **70–99** style score range

## NestJS integration

| NestJS consumer | Stylist endpoint | Behavior |
|-----------------|------------------|----------|
| `ClothingAiService` | `POST /v1/clothing/analyze` | Always calls Python; saves AI category, color, embedding |
| `OutfitsService` via `StylistService` | `POST /v1/outfits/recommend` | Always calls Python; no local mock fallback |

If the Python service is unreachable, NestJS returns **503** with `"AI Stylist is currently offline"`.

## Local development

```powershell
cd wardrobe-ai/ai-services/stylist-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:STYLIST_MOCK = "true"
uvicorn app.main:app --reload --port 8001
```

Configure NestJS:

```env
PYTHON_STYLIST_URL=http://localhost:8001
```

## Docker Compose

```powershell
cd wardrobe-ai
docker compose up stylist-service --build
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PYTHON_STYLIST_URL` | `http://localhost:8001` | Primary base URL for NestJS gateway |
| `STYLIST_SERVICE_URL` | `http://localhost:8001` | Fallback alias |
| `STYLIST_MOCK` | `false` | Python-side mock (skip PyTorch model load) |
| `STYLIST_SERVICE_TIMEOUT_MS` | `15000` | NestJS HTTP timeout |
| `MAX_IMAGE_SIZE_MB` | `10` | Upload limit |
| `EMBEDDING_SIZE` | `512` | Vector dimensions |

## Tests

```powershell
cd ai-services/stylist-service
$env:STYLIST_MOCK = "true"
pytest
```

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `MISSING_IMAGE` | 400 | No image provided |
| `INVALID_IMAGE_FORMAT` | 400 | Not a readable JPEG/PNG |
| `IMAGE_TOO_LARGE` | 400 | Exceeds upload limit |
| `INSUFFICIENT_WARDROBE` | 400 | Missing Top, Bottom, or Footwear |
| `RECOMMENDATION_FAILED` | 400 | No valid combination found |
