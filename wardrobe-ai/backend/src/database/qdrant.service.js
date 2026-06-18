const {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { QdrantClient } = require('@qdrant/js-client-rest');

@Injectable()
class QdrantService {
  constructor(@Inject(ConfigService) configService) {
    this.configService = configService;
    this.logger = new Logger(QdrantService.name);
    this.client = null;
  }

  async onModuleInit() {
    try {
      const url = this.configService.get('database.qdrant.url');
      this.client = new QdrantClient({ url });

      const collections = await this.client.getCollections();
      const name = this.getCollectionName();
      const exists = collections.collections.some((c) => c.name === name);

      if (exists) {
        this.logger.log(`Qdrant connected — collection '${name}' ready`);
      } else {
        this.logger.warn(`Collection '${name}' not found — run init_users_face_vectors.ps1`);
      }
    } catch (error) {
      this.client = null;
      this.logger.error(
        `Qdrant unavailable — start Docker: docker compose up -d (${error.message})`,
      );
    }
  }

  onModuleDestroy() {
    this.client = null;
  }

  getClient() {
    if (!this.client) throw new Error('Qdrant client is not initialized');
    return this.client;
  }

  getCollectionName() {
    return this.configService.get('database.qdrant.collectionFaces') ?? 'users_face_vectors';
  }

  getSimilarityThreshold() {
    return this.configService.get('database.qdrant.similarityThreshold') ?? 0.75;
  }

  async healthCheck() {
    try {
      await this.getClient().getCollections();
      return true;
    } catch {
      return false;
    }
  }

  async upsertFaceVector(pointId, vector, payload) {
    await this.getClient().upsert(this.getCollectionName(), {
      wait: true,
      points: [{ id: pointId, vector, payload }],
    });
  }

  async searchFaceVectors(vector, limit = 1) {
    return this.getClient().search(this.getCollectionName(), {
      vector,
      limit,
      with_payload: true,
      score_threshold: this.getSimilarityThreshold(),
    });
  }

  async deleteFaceByUserId(userId) {
    await this.getClient().delete(this.getCollectionName(), {
      wait: true,
      filter: { must: [{ key: 'user_id', match: { value: userId } }] },
    });
  }
}

module.exports = { QdrantService };
