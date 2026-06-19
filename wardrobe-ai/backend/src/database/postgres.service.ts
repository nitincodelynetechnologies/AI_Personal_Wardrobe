import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { applyPendingMigrations } from './postgres-migrations.util';
import { POSTGRES_PHASE2_TABLES, POSTGRES_PHASE3_TABLES, POSTGRES_TABLES } from './schema.registry';

const CONNECT_RETRIES = 5;
const CONNECT_RETRY_MS = 2000;

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private pool: Pool | null = null;
  private ready = false;

  readonly tables = POSTGRES_TABLES;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const pg = this.configService.get('database.postgres');

    for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt += 1) {
      try {
        this.pool = new Pool({
          host: pg.host,
          port: pg.port,
          user: pg.user,
          password: pg.password,
          database: pg.database,
          max: pg.pool.max,
          idleTimeoutMillis: pg.pool.idleTimeoutMs,
        });

        const result = await this.pool.query('SELECT NOW() AS server_time');
        this.logger.log(
          `PostgreSQL connected — ${result.rows[0].server_time} (${pg.host}:${pg.port}/${pg.database})`,
        );

        await applyPendingMigrations(this.pool, this.logger);
        await this.verifyRegisteredTables();
        this.ready = true;
        return;
      } catch (error) {
        this.ready = false;
        await this.pool?.end().catch(() => undefined);
        this.pool = null;

        this.logConnectionError('PostgreSQL connection attempt failed', error, attempt);

        if (attempt === CONNECT_RETRIES) {
          this.logger.error(
            'PostgreSQL unavailable after retries — start Docker: docker compose up -d postgres',
          );
          return;
        }

        await this.delay(CONNECT_RETRY_MS);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
    this.pool = null;
    this.ready = false;
    this.logger.log('PostgreSQL pool closed');
  }

  isReady(): boolean {
    return this.ready && this.pool !== null;
  }

  assertReady(): void {
    if (!this.isReady()) {
      throw new ServiceUnavailableException(
        'PostgreSQL is not connected. Start Docker: docker compose up -d postgres',
      );
    }
  }

  getPool(): Pool {
    this.assertReady();
    return this.pool!;
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.getPool().query<T>(text, params);
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isReady()) return false;

    try {
      const result = await this.pool!.query<{ ok: number }>('SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    } catch (error) {
      this.logConnectionError('PostgreSQL health check failed', error);
      return false;
    }
  }

  private async verifyRegisteredTables(): Promise<void> {
    const requiredTables = [this.tables.USERS, ...POSTGRES_PHASE2_TABLES, ...POSTGRES_PHASE3_TABLES];

    for (const table of requiredTables) {
      const result = await this.pool!.query<{ reg: string | null }>(
        'SELECT to_regclass($1) AS reg',
        [table],
      );

      if (result.rows[0]?.reg) {
        this.logger.log(`PostgreSQL table registered — ${table}`);
      } else {
        this.logger.warn(`Table '${table}' not found after migrations`);
      }
    }
  }

  private logConnectionError(message: string, error: unknown, attempt?: number): void {
    const prefix = attempt ? `${message} (attempt ${attempt}/${CONNECT_RETRIES})` : message;

    if (error instanceof Error) {
      this.logger.error(`${prefix}: ${error.message}`, error.stack);
      return;
    }

    this.logger.error(`${prefix}: ${JSON.stringify(error)}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
