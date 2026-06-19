export { DatabaseModule } from './database.module';
export { PostgresService } from './postgres.service';
export { QdrantService } from './qdrant.service';
export {
  POSTGRES_TABLES,
  POSTGRES_PHASE2_TABLES,
  POSTGRES_PHASE3_TABLES,
  QDRANT_COLLECTION_KEYS,
  QDRANT_COLLECTION_DEFAULTS,
} from './schema.registry';
export type {
  ClothingItemVectorPayload,
  FashionDnaVectorPayload,
  RecommendationVectorPayload,
  PostgresTableName,
} from './schema.registry';
