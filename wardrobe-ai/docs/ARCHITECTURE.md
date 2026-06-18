# Architecture Overview

## Paradigm: Local-First Enterprise

All infrastructure runs locally via Docker. No cloud services are required for development or testing.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP
┌─────────────────────────────▼───────────────────────────────────┐
│                    frontend/  (Next.js 15)                        │
│                    Port 3002                                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API
┌─────────────────────────────▼───────────────────────────────────┐
│                    backend/  (NestJS Gateway)                     │
│                    Port 3001                                      │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │    Redis     │  │  ai-services/    │
│  Port 5432   │  │  Port 6379   │  │  face-service    │
│  Relational  │  │  Cache       │  │  Port 8000       │
└──────────────┘  └──────────────┘  └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────┐
                    ▼                        ▼                ▼
             ┌──────────────┐        ┌──────────────┐  ┌──────────┐
             │   Qdrant     │        │    MinIO     │  │  Future  │
             │  Port 6333   │        │  Port 9000   │  │ Services │
             │  Vectors     │        │  Files       │  └──────────┘
             └──────────────┘        └──────────────┘
```

## Service Responsibilities

### frontend/
- Next.js 15 App Router, ShadCN UI, Tailwind
- Feature-based organization (`src/features/`)
- Zustand (global state) + TanStack Query (API)
- Face registration UI, wardrobe dashboard

### backend/
- NestJS API Gateway
- Authentication, authorization, routing
- Orchestrates calls to AI services and databases
- Owns `database/migrations/`

### ai-services/
- Independent Python/FastAPI microservices
- `face-service/` — 512-dim embedding generation, liveness validation
- Stateless; stores results via backend into Qdrant/MinIO

### database/
- `init/` — PostgreSQL bootstrap (extensions, schema)
- `migrations/` — Versioned DDL owned by backend

### docker/
- Service-specific configuration overrides
- Referenced by root `docker-compose.yml`

## Data Flow: Face Registration

1. User captures images in `frontend/`
2. `frontend/` sends multipart request to `backend/` (`POST /auth/face/register`)
3. `backend/` stores raw images in MinIO (`face-captures` bucket)
4. `backend/` calls `ai-services/face-service` for embedding
5. `face-service` returns 512-dim vector
6. `backend/` upserts vector into Qdrant (`users_face_vectors`)
7. `backend/` persists user metadata in PostgreSQL
8. `backend/` returns routing token to `frontend/`

## Network

All containers share the `wardrobe-net` bridge network. Host ports are exposed for local development tooling (frontend, API clients, database GUIs).

## Security (Local Dev)

- Credentials in `.env` only — never in `docker-compose.yml`
- MinIO buckets are private by default (`mc anonymous set none`)
- Redis requires password authentication
- Production hardening (TLS, secrets manager) is a separate deployment concern

## Scaling Path

| Phase | Change                                              |
|-------|-----------------------------------------------------|
| Now   | Single-machine Docker Compose                       |
| Next  | Add backend + ai-services to compose with Dockerfiles |
| Later | Kubernetes manifests in `docker/k8s/` (optional)    |
