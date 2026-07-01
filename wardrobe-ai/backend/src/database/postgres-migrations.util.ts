import { Logger } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { POSTGRES_TABLES } from './schema.registry';

export function resolveMigrationsDir(): string {
  const candidates = [
    // Copied during `npm run build` (Render Node + Docker)
    join(__dirname, '..', '..', 'database', 'postgres', 'migrations'),
    // Local dev from backend/dist
    join(__dirname, '..', '..', '..', 'database', 'postgres', 'migrations'),
    // Render / monorepo cwd variants
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
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Bootstrap SQL skipped (${sql}): ${message}`);
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

export async function applyPendingMigrations(
  pool: Pool,
  logger: Logger,
): Promise<void> {
  await ensureWardrobeSchema(pool, logger);

  if (await usersTableExists(pool)) {
    return;
  }

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

  logger.warn(
    `Table '${POSTGRES_TABLES.USERS}' missing — applying ${files.length} migration(s)`,
  );

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    logger.log(`Applying PostgreSQL migration: ${file}`);
    await pool.query(sql);
  }

  logger.log('PostgreSQL migrations applied successfully');
}
