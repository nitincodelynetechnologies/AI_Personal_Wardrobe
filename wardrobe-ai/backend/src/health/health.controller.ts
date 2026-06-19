import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostgresService } from '../database/postgres.service';
import { QdrantService } from '../database/qdrant.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly qdrantService: QdrantService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Service health check' })
  async check() {
    const [postgres, qdrant] = await Promise.allSettled([
      this.postgresService.healthCheck(),
      this.qdrantService.healthCheck(),
    ]);

    const postgresUp =
      postgres.status === 'fulfilled' && postgres.value === true && this.postgresService.isReady();
    const qdrantUp =
      qdrant.status === 'fulfilled' && qdrant.value === true && this.qdrantService.isReady();

    return {
      status: postgresUp && qdrantUp ? 'ok' : 'degraded',
      services: { postgres: postgresUp ? 'up' : 'down', qdrant: qdrantUp ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
    };
  }
}
