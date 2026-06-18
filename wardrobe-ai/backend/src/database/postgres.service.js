const {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { Pool } = require('pg');

@Injectable()
class PostgresService {
  constructor(@Inject(ConfigService) configService) {
    this.configService = configService;
    this.logger = new Logger(PostgresService.name);
    this.pool = null;
  }

  async onModuleInit() {
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
        `PostgreSQL unavailable — start Docker: docker compose up -d (${error.message})`,
      );
    }
  }

  async onModuleDestroy() {
    await this.pool?.end();
    this.logger.log('PostgreSQL pool closed');
  }

  getPool() {
    if (!this.pool) throw new Error('PostgreSQL pool is not initialized');
    return this.pool;
  }

  async query(text, params = []) {
    return this.getPool().query(text, params);
  }

  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }
}

module.exports = { PostgresService };
