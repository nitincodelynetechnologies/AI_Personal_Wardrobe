# Backend — NestJS API Gateway

TypeScript NestJS API for the AI Personal Wardrobe Platform.

## Phase 1: Authentication

| Module | Path | Responsibility |
|--------|------|----------------|
| `AuthModule` | `src/auth/` | Face register/login, JWT issuance |
| `UsersModule` | `src/users/` | PostgreSQL user CRUD |
| `DatabaseModule` | `src/database/` | PostgreSQL pool + Qdrant client |

## Quick Start

```bash
cd backend
npm install
npm run start:dev
```

- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs
- Health: http://localhost:3001/api/health

## Architecture

```
Controller (auth.controller.ts)
    └── AuthService (business logic)
            ├── UsersService      → PostgreSQL
            ├── QdrantService     → Qdrant vectors
            ├── FaceService       → Python AI (mocked)
            └── JwtService        → Token generation
```

See [docs/AUTH.md](../docs/AUTH.md) for API documentation.

## Environment

Reads from monorepo root `wardrobe-ai/.env`. Required:

- `POSTGRES_*` — PostgreSQL connection
- `QDRANT_URL` — Qdrant connection
- `JWT_SECRET` — JWT signing secret
