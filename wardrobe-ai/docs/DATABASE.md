# Database — Phase 1

User Management and Face Authentication database initialization.

## Quick Start

```powershell
# 1. Start infrastructure
docker compose up -d

# 2. PostgreSQL — create users table
.\scripts\run-postgres-migrations.ps1

# 3. Qdrant — create users_face_vectors collection
.\database\qdrant\init_users_face_vectors.ps1

# 4. Start NestJS backend
cd backend
npm install
npm run start:dev
```

Verify: `GET http://localhost:3001/api/health`

## Deliverables

| Artifact | Location |
|----------|----------|
| Users table migration | `database/postgres/migrations/001_create_users_table.up.sql` |
| Migration rollback | `database/postgres/migrations/001_create_users_table.down.sql` |
| Qdrant collection init | `database/qdrant/init_users_face_vectors.ps1` |
| Collection schema | `database/qdrant/collections/users_face_vectors.json` |
| PostgresService | `backend/src/database/postgres.service.js` |
| QdrantService | `backend/src/database/qdrant.service.js` |

## Schema Summary

### PostgreSQL: `wardrobe.users`

```
id            UUID PRIMARY KEY
email         VARCHAR(255)  — unique, case-insensitive
mobile        VARCHAR(20)     — unique
password_hash VARCHAR(255)    — required
status        ENUM            — pending | active | inactive | suspended | deleted
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ     — auto-updated via trigger
```

### Qdrant: `users_face_vectors`

```
Vector:    512 dimensions, Cosine distance
Payload:   user_id, name, email, avatar_url
Indexes:   user_id (keyword), email (keyword), name (keyword)
```

## Naming Conventions

- Tables and columns: `snake_case`
- Schema namespace: `wardrobe`
- Migration files: `{version}_{description}.{up|down}.sql`
