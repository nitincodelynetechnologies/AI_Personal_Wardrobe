const { Module } = require('@nestjs/common');
const { PostgresService } = require('./postgres.service');
const { QdrantService } = require('./qdrant.service');

@Module({
  providers: [PostgresService, QdrantService],
  exports: [PostgresService, QdrantService],
})
class DatabaseModule {}

module.exports = { DatabaseModule };
