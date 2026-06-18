# AI Personal Wardrobe Platform

Local-first, 100% Dockerized enterprise monorepo.

## Repository Structure

```
wardrobe-ai/
├── docker-compose.yml      # All infrastructure services
├── .env.example            # Environment template (copy to .env)
├── frontend/               # Next.js 15 App Router (UI)
├── backend/                # NestJS API Gateway
├── ai-services/            # Python AI microservices
│   └── face-service/       # Face embedding & liveness
├── database/               # SQL init scripts & migrations
├── docker/                 # Service-specific Docker configs
├── docs/                   # Architecture & setup guides
└── scripts/                # Local dev automation
```

## Quick Start

```bash
cd wardrobe-ai
cp .env.example .env
docker compose up -d
```

See [docs/SETUP.md](docs/SETUP.md) for the full guide.

## Services

| Service    | Port | Description                |
|------------|------|----------------------------|
| PostgreSQL | 5432 | Relational data            |
| Redis      | 6379 | Cache & sessions           |
| Qdrant     | 6333 | Vector embeddings          |
| MinIO      | 9000 | Object storage (S3-compat) |
| MinIO UI   | 9001 | Storage console            |
| Frontend   | 3002 | Next.js UI                 |
| Backend    | 3001 | NestJS API (planned)       |

## Architecture Principles

- **Local-first** — no cloud dependency for development
- **Dockerized** — all infrastructure runs in containers
- **Feature-based** — frontend and backend organized by domain
- **Persistent data** — named volumes for PostgreSQL, Qdrant, MinIO
