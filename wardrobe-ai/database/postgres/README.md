# PostgreSQL Migrations

Versioned schema migrations for the AI Personal Wardrobe Platform.

## Structure

```
postgres/
└── migrations/
    ├── 001_create_users_table.up.sql
    └── 001_create_users_table.down.sql
```

## Running Migrations

**Windows:**

```powershell
.\scripts\run-postgres-migrations.ps1
```

**macOS / Linux:**

```bash
chmod +x scripts/run-postgres-migrations.sh
./scripts/run-postgres-migrations.sh
```

Requires `psql` CLI and a running PostgreSQL container.

## Phase 1: `wardrobe.users`

| Column         | Type         | Notes                          |
|----------------|--------------|--------------------------------|
| `id`           | UUID         | Primary key, auto-generated    |
| `email`        | VARCHAR(255) | Unique (case-insensitive)      |
| `mobile`       | VARCHAR(20)  | Unique                         |
| `password_hash`| VARCHAR(255) | Required                     |
| `status`       | ENUM         | pending, active, inactive…     |
| `created_at`   | TIMESTAMPTZ  | Auto-set on insert             |
| `updated_at`   | TIMESTAMPTZ  | Auto-updated via trigger       |

At least one of `email` or `mobile` must be provided.

## Rollback

```bash
psql -h localhost -U wardrobe_user -d wardrobe_db -f database/postgres/migrations/001_create_users_table.down.sql
```
