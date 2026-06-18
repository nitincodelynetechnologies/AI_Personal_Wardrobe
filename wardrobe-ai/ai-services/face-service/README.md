# Face Service

FastAPI microservice for biometric face processing.

## Responsibilities

- Accept face capture images
- Run liveness validation
- Generate 512-dimensional face embeddings
- Return vectors for storage in Qdrant (`users_face_vectors`)

## Endpoints (planned)

| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| POST   | `/embed`          | Generate face vector     |
| POST   | `/liveness/check`   | Validate liveness        |
| GET    | `/health`         | Health check             |

## Local Development (future)

```bash
cd ai-services/face-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment

Uses `FACE_SERVICE_URL` and connects to MinIO/Qdrant via backend orchestration.
