import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      const pg = this.configService.get('database.postgres');
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
      this.logger.log(`PostgreSQL connected — ${result.rows[0].server_time}`);
    } catch (error) {
      this.logger.error(
        `PostgreSQL unavailable — start Docker: docker compose up -d (${(error as Error).message})`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
    this.logger.log('PostgreSQL pool closed');
  }

  getPool(): Pool {
    if (!this.pool) throw new Error('PostgreSQL pool is not initialized');
    return this.pool;
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.getPool().query<T>(text, params);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query<{ ok: number }>('SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }
}
