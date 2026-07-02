import { Logger } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { POSTGRES_TABLES } from './schema.registry';

export function resolveMigrationsDir(): string {
  const candidates = [
    join(__dirname, '..', '..', 'database', 'postgres', 'migrations'),
    join(__dirname, '..', '..', '..', 'database', 'postgres', 'migrations'),
    join(process.cwd(), 'database', 'postgres', 'migrations'),
    join(process.cwd(), '..', 'database', 'postgres', 'migrations'),
  ];

  for (const dir of candidates) {
    if (existsSync(dir)) {
      return dir;
    }
  }

  return candidates[0];
}

export async function ensureWardrobeSchema(
  pool: Pool,
  logger: Logger,
): Promise<void> {
  const statements = [
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
    'CREATE SCHEMA IF NOT EXISTS wardrobe',
    `CREATE TABLE IF NOT EXISTS wardrobe.schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Bootstrap SQL skipped (${sql.slice(0, 60)}…): ${message}`);
    }
  }
}

export async function usersTableExists(pool: Pool): Promise<boolean> {
  const result = await pool.query<{ reg: string | null }>(
    'SELECT to_regclass($1) AS reg',
    [POSTGRES_TABLES.USERS],
  );
  return Boolean(result.rows[0]?.reg);
}

async function getAppliedMigrationVersions(pool: Pool): Promise<Set<string>> {
  try {
    const result = await pool.query<{ version: string }>(
      'SELECT version FROM wardrobe.schema_migrations',
    );
    return new Set(result.rows.map((row) => row.version));
  } catch {
    return new Set();
  }
}

export async function applyPendingMigrations(
  pool: Pool,
  logger: Logger,
): Promise<void> {
  await ensureWardrobeSchema(pool, logger);

  const migrationsDir = resolveMigrationsDir();

  if (!existsSync(migrationsDir)) {
    logger.error(
      `Migration directory not found: ${migrationsDir}. Run npm run build on the backend service.`,
    );
    return;
  }

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.up.sql'))
    .sort();

  if (!files.length) {
    logger.warn(`No migration files found in ${migrationsDir}`);
    return;
  }

  const freshDatabase = !(await usersTableExists(pool));
  const applied = await getAppliedMigrationVersions(pool);

  const pending = freshDatabase
    ? files
    : files.filter((file) => !applied.has(file.replace(/\.up\.sql$/, '')));

  if (!pending.length) {
    return;
  }

  logger.warn(
    freshDatabase
      ? `Fresh database — applying ${pending.length} migration(s)`
      : `Applying ${pending.length} pending migration(s)`,
  );

  for (const file of pending) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    logger.log(`Applying PostgreSQL migration: ${file}`);
    await pool.query(sql);
  }

  logger.log('PostgreSQL migrations applied successfully');
}
