# Local Infrastructure Setup

This guide walks you through starting all local services for the AI Personal Wardrobe Platform using Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- 4 GB+ free RAM for all containers
- Ports available: `5432`, `6379`, `6333`, `9000`, `9001`

## 1. Configure Environment

From the `wardrobe-ai/` root:

```bash
cp .env.example .env
```

Edit `.env` and set secure passwords:

```env
POSTGRES_PASSWORD=your_postgres_password
REDIS_PASSWORD=your_redis_password
MINIO_ROOT_PASSWORD=your_minio_password
```

> **Never commit `.env` to version control.** Credentials are injected at runtime — nothing is hardcoded in `docker-compose.yml`.

## 2. Start All Containers

### Option A — Docker Compose (recommended)

```bash
docker compose up -d
```

### Option B — Helper script

**Windows (PowerShell):**

```powershell
.\scripts\start.ps1
```

**macOS / Linux:**

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

## 3. Verify Services

```bash
docker compose ps
```

All services should show `healthy` or `running`:

| Container          | Endpoint                        | Purpose              |
|--------------------|---------------------------------|----------------------|
| wardrobe-postgres  | `localhost:5432`                | Relational database  |
| wardrobe-redis     | `localhost:6379`                | Cache & sessions     |
| wardrobe-qdrant    | `http://localhost:6333`         | Vector database      |
| wardrobe-minio     | `http://localhost:9000`         | Object storage API   |
| wardrobe-minio     | `http://localhost:9001`         | MinIO web console    |

### Health checks

```bash
# PostgreSQL
docker exec wardrobe-postgres pg_isready -U wardrobe_user

# Redis
docker exec wardrobe-redis redis-cli -a $REDIS_PASSWORD ping

# Qdrant
curl http://localhost:6333/healthz

# MinIO
curl http://localhost:9000/minio/health/live
```

## 4. Initialize Databases (Phase 1)

### PostgreSQL — users table

**Windows:**

```powershell
.\scripts\run-postgres-migrations.ps1
```

**macOS / Linux:**

```bash
./scripts/run-postgres-migrations.sh
```

Or via Docker (no local `psql` required):

```bash
docker exec -i wardrobe-postgres psql -U wardrobe_user -d wardrobe_db \
  < database/postgres/migrations/001_create_users_table.up.sql
```

### Qdrant — users_face_vectors collection

```powershell
.\database\qdrant\init_users_face_vectors.ps1
```

See [DATABASE.md](DATABASE.md) for schema details.

## 5. Initialize Qdrant Collections (legacy script)

After containers are healthy, create vector collections:

**Windows:**

```powershell
.\scripts\init-qdrant.ps1
```

**macOS / Linux:**

```bash
./scripts/init-qdrant.sh
```

This creates:

- `users_face_vectors` — 512-dim face embeddings
- `style_embeddings` — 512-dim style vectors

## 6. Start the Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # or symlink
npm run dev
```

Open **http://localhost:3002**

## 7. Stop Services

```bash
docker compose down
```

Or use `scripts/stop.ps1` / `scripts/stop.sh`.

> Data is preserved in named Docker volumes. Use `docker compose down -v` only if you want to **wipe all data**.

## Persistent Volumes

| Volume Name              | Service    | Mount Point              |
|--------------------------|------------|--------------------------|
| `wardrobe-postgres-data` | PostgreSQL | `/var/lib/postgresql/data` |
| `wardrobe-redis-data`    | Redis      | `/data`                  |
| `wardrobe-qdrant-data`   | Qdrant     | `/qdrant/storage`        |
| `wardrobe-minio-data`    | MinIO      | `/data`                  |

## MinIO Buckets

The `minio-init` service automatically creates:

- `wardrobe-assets` — wardrobe images and media
- `face-captures` — biometric capture uploads

Access the console at **http://localhost:9001** using `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` from `.env`.

## Troubleshooting

### Port already in use

Change the host port in `.env` (e.g. `POSTGRES_PORT=5433`) and restart:

```bash
docker compose down
docker compose up -d
```

### Containers not healthy

```bash
docker compose logs postgres
docker compose logs qdrant
docker compose logs minio
```

### Reset all data

```bash
docker compose down -v
docker compose up -d
```

## Next Steps

- Scaffold the NestJS backend in `backend/`
- Implement the face embedding service in `ai-services/face-service/`
- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
