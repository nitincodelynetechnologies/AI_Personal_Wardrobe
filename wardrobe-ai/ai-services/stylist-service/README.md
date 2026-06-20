# Stylist Service

Python FastAPI microservice for **Phase 5 — The Real AI Stylist**.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| POST | `/v1/clothing/analyze` | Category, dominant color, 512-dim embedding |
| POST | `/v1/outfits/recommend` | Best Top/Bottom/Footwear combination |

## Local development

```powershell
cd ai-services/stylist-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:STYLIST_MOCK = "true"
uvicorn app.main:app --reload --port 8001
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STYLIST_MOCK` | `false` | Skip PyTorch model load; use deterministic mock analysis |
| `MAX_IMAGE_SIZE_MB` | `10` | Upload size limit |
| `EMBEDDING_SIZE` | `512` | Output embedding dimensions |
| `STYLE_SCORE_MIN` | `70` | Minimum outfit style score |
| `STYLE_SCORE_MAX` | `99` | Maximum outfit style score |

## Tests

```powershell
cd ai-services/stylist-service
$env:STYLIST_MOCK = "true"
pytest
```

## Docker

```powershell
cd wardrobe-ai
docker compose up stylist-service --build
```

Default port: **8001**
