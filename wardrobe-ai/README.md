# AI Personal Wardrobe Platform

Production-ready, Docker-first multi-service monorepo for AI-powered wardrobe management, face auth, and outfit styling.

## Architecture (6 Core Services)

| Service | Container | Port | Role |
|---------|-----------|------|------|
| **Frontend** | `wardrobe-frontend` | 3000 | Next.js 15 App Router |
| **API Gateway** | `wardrobe-backend` | 3001 | NestJS REST API |
| **PostgreSQL** | `wardrobe-postgres` | 5432 | Relational data |
| **Qdrant** | `wardrobe-qdrant` | 6333 | Vector embeddings |
| **Face AI** | `wardrobe-face-service` | 8000 | Python FastAPI — InsightFace |
| **Stylist AI** | `wardrobe-stylist-service` | 8001 | Python FastAPI — analysis & bg removal |

All services communicate over the internal Docker network **`wardrobe-network`** using container hostnames (e.g. `http://stylist-service:8001`).

## Repository Structure

```
wardrobe-ai/
├── docker-compose.yml      # Unified 6-service stack
├── .env.example            # Central environment template
├── start-platform.sh       # One-command stack launcher
├── frontend/               # Next.js UI (+ Dockerfile)
├── backend/                # NestJS API (+ Dockerfile)
├── ai-services/
│   ├── face-service/       # Face embedding & liveness
│   └── stylist-service/    # Clothing analysis & recommendations
├── database/               # SQL init & migrations
├── docker/                 # Qdrant config overrides
├── docs/                   # Setup & architecture guides
└── scripts/                # Migrations & Qdrant init helpers
```

## Quick Start (Docker — Recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Compose v2
- 8 GB+ RAM recommended (AI services load ML models)
- Host ports free: `3000`, `3001`, `5432`, `6333`, `8000`, `8001`

### 1. Configure environment

```bash
cd wardrobe-ai
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD, JWT_SECRET, etc.
```

### 2. Launch the full stack

**macOS / Linux / Git Bash:**

```bash
chmod +x start-platform.sh scripts/*.sh
./start-platform.sh
```

**Windows (PowerShell):**

```powershell
.\scripts\start-platform.ps1
```

This script:

1. Verifies Docker is running
2. Prunes dangling networks
3. Runs `docker compose up --build -d`
4. Applies PostgreSQL migrations
5. Initializes Qdrant collections

### 3. Open the app

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Next.js frontend |
| http://localhost:3001/api | NestJS API |
| http://localhost:3001/api/docs | Swagger UI |
| http://localhost:8000/health | Face service |
| http://localhost:8001/health | Stylist service |

### Stop / reset

```bash
docker compose down          # stop, keep volumes
docker compose down -v       # stop + wipe all persisted data
```

## Local Development (Hybrid)

Run infrastructure + AI in Docker, apps on the host:

```bash
docker compose up -d postgres qdrant face-service stylist-service
cd backend && npm install && npm run start:dev
cd frontend && npm install && npm run dev
```

Use `localhost` URLs from `.env.example` for host-based dev.

## Persistent Volumes

| Volume | Service | Data |
|--------|---------|------|
| `wardrobe-postgres-data` | PostgreSQL | Users, wardrobe, outfits |
| `wardrobe-qdrant-data` | Qdrant | Face & clothing vectors |
| `wardrobe-uploads-data` | Backend | Wardrobe image files |

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — Full environment setup & troubleshooting
- [docs/STYLIST.md](docs/STYLIST.md) — Stylist AI service
- [docs/AUTH.md](docs/AUTH.md) — Face authentication
- [docker/README.md](docker/README.md) — Docker configuration notes

## Architecture Principles

- **Docker-first** — single compose file for production-like local runs
- **Service discovery** — internal DNS via `wardrobe-network`, no hardcoded localhost in containers
- **Graceful degradation** — AI fallbacks when Python services are unavailable
- **Persistent data** — named volumes survive container restarts
