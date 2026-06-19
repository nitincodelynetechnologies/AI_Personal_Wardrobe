import { Logger } from '@nestjs/common';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { POSTGRES_TABLES } from './schema.registry';

export function resolveMigrationsDir(): string {
  return join(__dirname, '..', '..', '..', 'database', 'postgres', 'migrations');
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
  if (await usersTableExists(pool)) {
    return;
  }

  const migrationsDir = resolveMigrationsDir();
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.up.sql'))
    .sort();

  if (!files.length) {
    logger.warn(`No migration files found in ${migrationsDir}`);
    return;
  }

  logger.warn(`Table '${POSTGRES_TABLES.USERS}' missing — applying ${files.length} migration(s)`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    logger.log(`Applying PostgreSQL migration: ${file}`);
    await pool.query(sql);
  }

  logger.log('PostgreSQL migrations applied successfully');
}
