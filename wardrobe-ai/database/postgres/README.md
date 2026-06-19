# PostgreSQL Migrations

Versioned schema migrations for the AI Personal Wardrobe Platform.

## Structure

```
postgres/
└── migrations/
    ├── 001_create_users_table.up.sql
    ├── 001_create_users_table.down.sql
    ├── 002_create_user_profile_tables.up.sql
    └── 002_create_user_profile_tables.down.sql
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

## Phase 2 Tables

All Phase 2 tables reference `wardrobe.users(id)` with `ON DELETE CASCADE`.

### `wardrobe.user_profiles`

| Column      | Type          | Notes                    |
|-------------|---------------|--------------------------|
| `id`        | UUID          | Primary key              |
| `user_id`   | UUID          | Unique FK → users        |
| `gender`    | VARCHAR(50)   |                          |
| `age`       | SMALLINT      | 0–150                    |
| `height`    | NUMERIC(5,2)  | Centimeters              |
| `weight`    | NUMERIC(5,2)  | Kilograms                |
| `body_type` | VARCHAR(50)   |                          |
| `skin_tone` | VARCHAR(50)   |                          |

### `wardrobe.user_preferences`

| Column            | Type         | Notes                    |
|-------------------|--------------|--------------------------|
| `id`              | UUID         | Primary key              |
| `user_id`         | UUID         | Unique FK → users        |
| `favorite_colors` | JSONB        | Array of color labels    |
| `favorite_brands` | JSONB        | Array of brand names     |
| `budget_range`    | VARCHAR(50)  | e.g. low, mid, premium   |
| `fashion_style`   | VARCHAR(100) | Primary style label      |

### `wardrobe.fashion_dna`

| Column            | Type          | Notes                    |
|-------------------|---------------|--------------------------|
| `id`              | UUID          | Primary key              |
| `user_id`         | UUID          | Unique FK → users        |
| `style_score`     | NUMERIC(5,2)  | 0–100                    |
| `color_affinity`  | JSONB         | Color → score map        |
| `brand_affinity`  | JSONB         | Brand → score map        |
| `lifestyle_score` | NUMERIC(5,2)  | 0–100                    |

## Rollback

```bash
psql -h localhost -U wardrobe_user -d wardrobe_db -f database/postgres/migrations/002_create_user_profile_tables.down.sql
psql -h localhost -U wardrobe_user -d wardrobe_db -f database/postgres/migrations/001_create_users_table.down.sql
```
