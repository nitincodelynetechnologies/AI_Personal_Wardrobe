# Face Service

FastAPI microservice for biometric face embedding using **InsightFace** (512-dimensional ArcFace vectors).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/face/embed` | Extract 512-dim face embedding |
| GET | `/health` | Service health check |

## Request — `POST /v1/face/embed`

**Multipart form-data** (preferred):

| Field | Required | Description |
|-------|----------|-------------|
| `file` | one of | Primary image upload (JPEG/PNG) |
| `image` | one of | Alternate upload field |
| `images` | one of | NestJS gateway compatibility field |
| `image_base64` | one of | Base64-encoded JPEG/PNG |

**Response:**

```json
{
  "embedding": [0.012, -0.034, "...512 floats"]
}
```

**Validation errors (400):**

| Code | Condition |
|------|-----------|
| `MISSING_IMAGE` | No image provided |
| `INVALID_IMAGE_FORMAT` | Not JPEG/PNG or corrupt file |
| `IMAGE_TOO_LARGE` | Exceeds `MAX_IMAGE_SIZE_MB` (default 10) |
| `NO_FACE_DETECTED` | Zero faces in image |
| `MULTIPLE_FACES_DETECTED` | More than one face in image |

## Local Development

```bash
cd ai-services/face-service
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: http://localhost:8000/docs

## Docker

```bash
cd wardrobe-ai
docker compose up -d face-service
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `FACE_MODEL_NAME` | `buffalo_l` | InsightFace model pack |
| `MAX_IMAGE_SIZE_MB` | `10` | Max upload size |
| `INSIGHTFACE_CTX_ID` | `-1` | CPU inference (`-1` = CPU) |
| `FACE_DET_SIZE` | `640` | Face detector input size |

## NestJS Integration

Set in `.env`:

```env
FACE_SERVICE_MOCK=false
FACE_SERVICE_URL=http://localhost:8000
```

The NestJS gateway calls `POST {FACE_SERVICE_URL}/v1/face/embed` with multipart field `images`.
