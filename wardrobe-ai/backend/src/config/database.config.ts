import { registerAs } from '@nestjs/config';

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
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB || 'wardrobe_db',
      pool: {
        max: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
        idleTimeoutMs: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
      },
    },
    qdrant: {
      url: resolveEnvUrl(process.env.QDRANT_URL, `http://${qdrantHost}:${qdrantPort}`),
      collectionFaces: process.env.QDRANT_COLLECTION_FACES || 'users_face_vectors',
      vectorSize: parseInt(process.env.QDRANT_FACE_VECTOR_SIZE || '512', 10),
      similarityThreshold: parseFloat(process.env.QDRANT_SIMILARITY_THRESHOLD || '0.75'),
    },
  };
});
