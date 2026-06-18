import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { QdrantService } from './qdrant.service';

@Module({
  providers: [PostgresService, QdrantService],
  exports: [PostgresService, QdrantService],
})
export class DatabaseModule {}
