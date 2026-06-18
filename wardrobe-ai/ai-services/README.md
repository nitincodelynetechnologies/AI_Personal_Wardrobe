# AI Services

Python microservices for ML/AI workloads. Each service is independently deployable.

## Services

| Service        | Port | Description                          |
|----------------|------|--------------------------------------|
| face-service   | 8000 | Face embedding & liveness detection  |

## Planned Structure

```
ai-services/
└── face-service/
    ├── app/
    │   ├── main.py
    │   ├── routes/
    │   └── models/
    ├── requirements.txt
    └── Dockerfile
```

## Integration

- Called by `backend/` over HTTP on the `wardrobe-net` Docker network
- Reads images from MinIO, writes vectors to Qdrant via backend orchestration
