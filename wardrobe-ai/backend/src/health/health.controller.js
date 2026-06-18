const { Controller, Get, Inject } = require('@nestjs/common');
const { ApiOperation, ApiTags } = require('@nestjs/swagger');
const { PostgresService } = require('../database/postgres.service');
const { QdrantService } = require('../database/qdrant.service');

@ApiTags('health')
@Controller('health')
class HealthController {
  constructor(
    @Inject(PostgresService) postgresService,
    @Inject(QdrantService) qdrantService,
  ) {
    this.postgresService = postgresService;
    this.qdrantService = qdrantService;
  }

  @Get()
  @ApiOperation({ summary: 'Service health check' })
  async check() {
    const [postgres, qdrant] = await Promise.allSettled([
      this.postgresService.healthCheck(),
      this.qdrantService.healthCheck(),
    ]);

    const postgresUp = postgres.status === 'fulfilled' && postgres.value;
    const qdrantUp = qdrant.status === 'fulfilled' && qdrant.value;

    return {
      status: postgresUp && qdrantUp ? 'ok' : 'degraded',
      services: { postgres: postgresUp ? 'up' : 'down', qdrant: qdrantUp ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = { HealthController };
