# Database

Local-first data layer for the AI Personal Wardrobe Platform.

## Structure

```
database/
├── init/              # PostgreSQL bootstrap (extensions, schema — auto on first start)
├── postgres/          # Versioned PostgreSQL migrations
│   └── migrations/
├── qdrant/            # Qdrant collection initialization
│   └── collections/
└── migrations/        # (deprecated — use postgres/migrations/)
```

## Phase 1 Setup

See [docs/DATABASE.md](../docs/DATABASE.md) for the full Phase 1 guide.

```powershell
.\scripts\run-postgres-migrations.ps1
.\database\qdrant\init_users_face_vectors.ps1
```

## Services

| Service    | Purpose                          | Port |
|------------|----------------------------------|------|
| PostgreSQL | Users, wardrobe items, metadata  | 5432 |
| Redis      | Cache, sessions, job queues      | 6379 |
| Qdrant     | Face vectors, style embeddings   | 6333 |
| MinIO      | Images, captures, assets         | 9000 |

## Persistent Volumes

- `wardrobe-postgres-data`
- `wardrobe-redis-data`
- `wardrobe-qdrant-data`
- `wardrobe-minio-data`
