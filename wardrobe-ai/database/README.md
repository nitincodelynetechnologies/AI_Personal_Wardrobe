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

## Setup

See [docs/DATABASE.md](../docs/DATABASE.md) for Phase 1 through Phase 4 guides.

```powershell
.\scripts\run-postgres-migrations.ps1
.\scripts\init-qdrant.ps1
```

Phase 2 only:

```powershell
# PostgreSQL Phase 2 tables (included in full migration run)
.\scripts\run-postgres-migrations.ps1

# Qdrant Phase 2 collections
.\database\qdrant\init_phase2_collections.ps1

# Qdrant Phase 3 collections
.\database\qdrant\init_phase3_collections.ps1
```

## Services

| Service    | Purpose                          | Port |
|------------|----------------------------------|------|
| PostgreSQL | Users, profiles, Fashion DNA, clothing items, outfits | 5432 |
| Redis      | Cache, sessions, job queues      | 6379 |
| Qdrant     | Face, Fashion DNA, recommendations, clothing vectors | 6333 |
| MinIO      | Images, captures, assets         | 9000 |

## Persistent Volumes

- `wardrobe-postgres-data`
- `wardrobe-redis-data`
- `wardrobe-qdrant-data`
- `wardrobe-minio-data`
