# Environment Setup Guide

Complete guide for running the AI Personal Wardrobe Platform with the unified Docker Compose stack.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser  →  http://localhost:3000  (Next.js frontend)    │
└───────────────────────────┬─────────────────────────────────┘
                            │ /api rewrites
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  wardrobe-backend :3001  (NestJS API Gateway)               │
│    ├── postgres:5432                                        │
│    ├── qdrant:6333                                          │
│    ├── face-service:8000                                    │
│    └── stylist-service:8001                                 │
└─────────────────────────────────────────────────────────────┘
         wardrobe-network (internal Docker bridge)
```

## Prerequisites

- Docker Desktop 4.x+ or Docker Engine 24+ with Compose v2
- 8 GB+ RAM (InsightFace + rembg + MobileNetV2 models)
- Free ports: **3000**, **3001**, **5432**, **6333**, **8000**, **8001**

## 1. Environment File

From `wardrobe-ai/`:

```bash
cp .env.example .env
```

**Required secrets** (change before any shared/production deployment):

| Variable | Purpose |
|----------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL auth |
| `JWT_SECRET` | JWT signing (min 32 chars) |

### Docker vs local dev hostnames

| Variable | Docker Compose (automatic) | Local npm dev |
|----------|---------------------------|---------------|
| `POSTGRES_HOST` | `postgres` | `localhost` |
| `QDRANT_URL` | `http://qdrant:6333` | `http://localhost:6333` |
| `FACE_SERVICE_URL` | `http://face-service:8000` | `http://localhost:8000` |
| `PYTHON_STYLIST_URL` | `http://stylist-service:8001` | `http://localhost:8001` |
| `BACKEND_API_URL` | `http://backend:3001/api` | `http://localhost:3001/api` |

> Docker Compose injects container hostnames via `docker-compose.yml`. The `.env` file is still used for secrets and host port mappings.

## 2. Start the Platform

### Full stack (recommended)

```bash
./start-platform.sh
```

Skip DB/Qdrant init (if already initialized):

```bash
./start-platform.sh --no-init
```

**Windows PowerShell:**

```powershell
.\scripts\start-platform.ps1
```

### Manual compose

```bash
docker compose up --build -d
docker compose ps
```

First startup may take **5–15 minutes** while AI Docker images build and download models (InsightFace buffalo_l, U-2-Net, MobileNetV2).

## 3. Verify Services

```bash
docker compose ps
```

Expected containers (all healthy or running):

| Container | Health URL |
|-----------|------------|
| `wardrobe-frontend` | http://localhost:3000 |
| `wardrobe-backend` | http://localhost:3001/api/health |
| `wardrobe-postgres` | `docker exec wardrobe-postgres pg_isready -U wardrobe_user` |
| `wardrobe-qdrant` | http://localhost:6333/readyz |
| `wardrobe-face-service` | http://localhost:8000/health |
| `wardrobe-stylist-service` | http://localhost:8001/health |

## 4. Database Initialization

`start-platform.sh` runs these automatically. To run manually:

**PostgreSQL migrations (via Docker):**

```bash
./scripts/run-postgres-migrations-docker.sh
```

**Qdrant collections:**

```bash
./scripts/init-qdrant.sh
```

See [DATABASE.md](DATABASE.md) for schema details.

## 5. Host Port Configuration

Override in `.env`:

```env
FRONTEND_PORT=3000
API_PORT=3001          # use 5000 to expose API on host port 5000
POSTGRES_PORT=5432
QDRANT_PORT=6333
FACE_SERVICE_PORT=8000
STYLIST_SERVICE_PORT=8001
```

## 6. Hybrid Local Development

Run only infrastructure + AI in Docker:

```bash
docker compose up -d postgres qdrant face-service stylist-service
```

Then run apps on the host:

```bash
# Terminal 1 — API
cd backend
npm install
npm run start:dev

# Terminal 2 — UI
cd frontend
npm install
npm run dev   # http://localhost:3003
```

Ensure `.env` uses `localhost` hostnames for this mode.

## 7. Stop Services

```bash
docker compose down
```

**Wipe all data** (PostgreSQL, Qdrant, uploads):

```bash
docker compose down -v
```

## Troubleshooting

### Docker not running

```
ERROR: Docker daemon is not running
```

Start Docker Desktop and retry `./start-platform.sh`.

### Port already in use

Change the conflicting port in `.env` (e.g. `API_PORT=5000`) and restart:

```bash
docker compose down
docker compose up -d
```

### AI service unhealthy on first start

AI containers need 2–3 minutes for model loading. Check logs:

```bash
docker compose logs face-service
docker compose logs stylist-service
```

### Backend cannot reach Python services

Ensure all services are on `wardrobe-network`:

```bash
docker network inspect wardrobe-network
```

Internal URLs must use service names, not `localhost`.

### Reset everything

```bash
docker compose down -v
docker network prune -f
./start-platform.sh
```

## Next Steps

- [AUTH.md](AUTH.md) — Face login & registration
- [STYLIST.md](STYLIST.md) — Clothing analysis & outfit AI
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
