import { registerAs } from '@nestjs/config';
import { QDRANT_COLLECTION_DEFAULTS, QDRANT_COLLECTION_KEYS } from '../database/schema.registry';

function resolveEnvUrl(
  template: string | undefined,
  fallback: string,
): string {
  if (template && !template.includes('${')) {
    return template;
  }
  return fallback;
}

export default registerAs('database', () => {
  const pgHost = process.env.POSTGRES_HOST || 'localhost';
  const pgPort = process.env.POSTGRES_PORT || '5432';
  const qdrantHost = process.env.QDRANT_HOST || 'localhost';
  const qdrantPort = process.env.QDRANT_PORT || '6333';

  return {
    postgres: {
      host: pgHost,
      port: parseInt(pgPort, 10),
      user: process.env.POSTGRES_USER || 'wardrobe_user',
      password: process.env.POSTGRES_PASSWORD || 'change_me_postgres_password',
      database: process.env.POSTGRES_DB || 'wardrobe_db',
      pool: {
        max: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
        idleTimeoutMs: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
      },
    },
    qdrant: {
      url: resolveEnvUrl(process.env.QDRANT_URL, `http://${qdrantHost}:${qdrantPort}`),
      collections: {
        [QDRANT_COLLECTION_KEYS.FACES]:
          process.env.QDRANT_COLLECTION_FACES ||
          QDRANT_COLLECTION_DEFAULTS[QDRANT_COLLECTION_KEYS.FACES],
        [QDRANT_COLLECTION_KEYS.FASHION_DNA]:
          process.env.QDRANT_COLLECTION_FASHION_DNA ||
          QDRANT_COLLECTION_DEFAULTS[QDRANT_COLLECTION_KEYS.FASHION_DNA],
        [QDRANT_COLLECTION_KEYS.RECOMMENDATIONS]:
          process.env.QDRANT_COLLECTION_RECOMMENDATIONS ||
          QDRANT_COLLECTION_DEFAULTS[QDRANT_COLLECTION_KEYS.RECOMMENDATIONS],
        [QDRANT_COLLECTION_KEYS.CLOTHING_ITEMS]:
          process.env.QDRANT_COLLECTION_CLOTHING_ITEMS ||
          QDRANT_COLLECTION_DEFAULTS[QDRANT_COLLECTION_KEYS.CLOTHING_ITEMS],
      },
      vectorSizes: {
        [QDRANT_COLLECTION_KEYS.FACES]: parseInt(
          process.env.QDRANT_FACE_VECTOR_SIZE || '512',
          10,
        ),
        [QDRANT_COLLECTION_KEYS.FASHION_DNA]: parseInt(
          process.env.QDRANT_FASHION_DNA_VECTOR_SIZE || '512',
          10,
        ),
        [QDRANT_COLLECTION_KEYS.RECOMMENDATIONS]: parseInt(
          process.env.QDRANT_RECOMMENDATION_VECTOR_SIZE || '512',
          10,
        ),
        [QDRANT_COLLECTION_KEYS.CLOTHING_ITEMS]: parseInt(
          process.env.QDRANT_CLOTHING_ITEM_VECTOR_SIZE || '512',
          10,
        ),
      },
      similarityThreshold: parseFloat(process.env.QDRANT_SIMILARITY_THRESHOLD || '0.75'),
    },
  };
});
