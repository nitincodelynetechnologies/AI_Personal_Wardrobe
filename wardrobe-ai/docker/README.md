# Docker Configuration

Service-specific Docker assets for the unified platform stack.

## Layout

```
docker/
└── qdrant/
    └── config.yaml    # Mounted as Qdrant production config
```

## Application Dockerfiles

| Service | Dockerfile | Port |
|---------|------------|------|
| NestJS API | `backend/Dockerfile` | 3001 |
| Next.js UI | `frontend/Dockerfile` | 3000 |
| Face AI | `ai-services/face-service/Dockerfile` | 8000 |
| Stylist AI | `ai-services/stylist-service/Dockerfile` | 8001 |

## Unified Compose

The root `docker-compose.yml` defines all 6 core services on **`wardrobe-network`**:

- Persistent volumes for PostgreSQL, Qdrant, and wardrobe uploads
- Health checks with `depends_on` ordering (AI services → backend → frontend)
- Internal service URLs (no localhost inside containers)

## Launch

```bash
./start-platform.sh
# or
docker compose up --build -d
```

## Volumes

| Named Volume | Mount Point | Purpose |
|--------------|-------------|---------|
| `wardrobe-postgres-data` | `/var/lib/postgresql/data` | PostgreSQL |
| `wardrobe-qdrant-data` | `/qdrant/storage` | Vector DB |
| `wardrobe-uploads-data` | `/app/uploads` | NestJS wardrobe images |

## Building Individual Services

```bash
docker compose build backend
docker compose build frontend
docker compose build face-service stylist-service
```

## Environment

Copy `.env.example` to `.env` at the repository root. Compose reads it automatically for variable substitution and secret injection.
