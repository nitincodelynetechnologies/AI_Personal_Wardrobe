import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { FaceVectorPayload } from '../users/interfaces/user.interface';
import {
  ClothingItemVectorPayload,
  FashionDnaVectorPayload,
  QDRANT_COLLECTION_KEYS,
  RecommendationVectorPayload,
} from './schema.registry';

const CONNECT_RETRIES = 5;
const CONNECT_RETRY_MS = 2000;

@Injectable()
export class QdrantService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient | null = null;
  private ready = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url =
      this.configService.get<string>('database.qdrant.url') || 'http://localhost:6333';

    for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt += 1) {
      try {
        this.client = new QdrantClient({ url, checkCompatibility: false });
        await this.client.getCollections();
        this.ready = true;
        await this.ensureRegisteredCollections();
        this.logger.log(`Qdrant connected — ${url}`);
        return;
      } catch (error) {
        this.ready = false;
        this.client = null;
        this.logConnectionError('Qdrant connection attempt failed', error, attempt);

        if (attempt === CONNECT_RETRIES) {
          this.logger.error(
            'Qdrant unavailable after retries — start Docker: docker compose up -d qdrant',
          );
          return;
        }

        await this.delay(CONNECT_RETRY_MS);
      }
    }
  }

  onModuleDestroy(): void {
    this.client = null;
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready && this.client !== null;
  }

  assertReady(): void {
    if (!this.isReady()) {
      throw new ServiceUnavailableException(
        'Qdrant is not connected. Start Docker: docker compose up -d qdrant',
      );
    }
  }

  private getClient(): QdrantClient {
    this.assertReady();
    return this.client!;
  }

  private resolveCollectionName(key: string): string {
    return this.configService.get<string>(`database.qdrant.collections.${key}`) ?? key;
  }

  getFaceCollectionName(): string {
    return this.resolveCollectionName(QDRANT_COLLECTION_KEYS.FACES);
  }

  getFashionDnaCollectionName(): string {
    return this.resolveCollectionName(QDRANT_COLLECTION_KEYS.FASHION_DNA);
  }

  getRecommendationCollectionName(): string {
    return this.resolveCollectionName(QDRANT_COLLECTION_KEYS.RECOMMENDATIONS);
  }

  getClothingItemCollectionName(): string {
    return this.resolveCollectionName(QDRANT_COLLECTION_KEYS.CLOTHING_ITEMS);
  }

  /** @deprecated Use getFaceCollectionName() */
  getCollectionName(): string {
    return this.getFaceCollectionName();
  }

  getSimilarityThreshold(): number {
    return this.configService.get<number>('database.qdrant.similarityThreshold') ?? 0.75;
  }

  private getVectorSize(key: string): number {
    return this.configService.get<number>(`database.qdrant.vectorSizes.${key}`) ?? 512;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isReady()) return false;

    try {
      await this.client!.getCollections();
      return true;
    } catch (error) {
      this.logConnectionError('Qdrant health check failed', error);
      return false;
    }
  }

  private async ensureRegisteredCollections(): Promise<void> {
    const client = this.client;
    if (!client) return;

    const collections = [
      {
        label: 'face vectors',
        name: this.getFaceCollectionName(),
        key: QDRANT_COLLECTION_KEYS.FACES,
      },
      {
        label: 'fashion DNA vectors',
        name: this.getFashionDnaCollectionName(),
        key: QDRANT_COLLECTION_KEYS.FASHION_DNA,
      },
      {
        label: 'recommendation vectors',
        name: this.getRecommendationCollectionName(),
        key: QDRANT_COLLECTION_KEYS.RECOMMENDATIONS,
      },
      {
        label: 'clothing item vectors',
        name: this.getClothingItemCollectionName(),
        key: QDRANT_COLLECTION_KEYS.CLOTHING_ITEMS,
      },
    ];

    const existing = await client.getCollections();
    const existingNames = new Set(existing.collections.map((collection) => collection.name));

    for (const collection of collections) {
      if (existingNames.has(collection.name)) {
        this.logger.log(`Qdrant collection registered — ${collection.name}`);
        continue;
      }

      await client.createCollection(collection.name, {
        vectors: {
          size: this.getVectorSize(collection.key),
          distance: 'Cosine',
        },
      });
      this.logger.log(`Created Qdrant collection — ${collection.name}`);
    }
  }

  async upsertFaceVector(
    pointId: string,
    vector: number[],
    payload: FaceVectorPayload,
  ): Promise<void> {
    await this.upsertVector(this.getFaceCollectionName(), pointId, vector, payload);
  }

  async searchFaceVectors(vector: number[], limit = 1) {
    return this.searchVectors(this.getFaceCollectionName(), vector, limit);
  }

  async deleteFaceByUserId(userId: string): Promise<void> {
    await this.deleteByUserId(this.getFaceCollectionName(), userId);
  }

  async upsertFashionDnaVector(
    pointId: string,
    vector: number[],
    payload: FashionDnaVectorPayload,
  ): Promise<void> {
    await this.upsertVector(this.getFashionDnaCollectionName(), pointId, vector, payload);
  }

  async searchFashionDnaVectors(vector: number[], limit = 5) {
    return this.searchVectors(this.getFashionDnaCollectionName(), vector, limit);
  }

  async deleteFashionDnaByUserId(userId: string): Promise<void> {
    await this.deleteByUserId(this.getFashionDnaCollectionName(), userId);
  }

  async upsertRecommendationVector(
    pointId: string,
    vector: number[],
    payload: RecommendationVectorPayload,
  ): Promise<void> {
    await this.upsertVector(this.getRecommendationCollectionName(), pointId, vector, payload);
  }

  async searchRecommendationVectors(vector: number[], limit = 10) {
    return this.searchVectors(this.getRecommendationCollectionName(), vector, limit);
  }

  async deleteRecommendationsByUserId(userId: string): Promise<void> {
    await this.deleteByUserId(this.getRecommendationCollectionName(), userId);
  }

  async upsertClothingItemVector(
    pointId: string,
    vector: number[],
    payload: ClothingItemVectorPayload,
  ): Promise<void> {
    await this.upsertVector(this.getClothingItemCollectionName(), pointId, vector, payload);
  }

  async searchClothingItemVectors(vector: number[], userId: string, limit = 10) {
    return this.getClient().search(this.getClothingItemCollectionName(), {
      vector,
      limit,
      with_payload: true,
      score_threshold: this.getSimilarityThreshold(),
      filter: { must: [{ key: 'user_id', match: { value: userId } }] },
    });
  }

  async deleteClothingItemsByUserId(userId: string): Promise<void> {
    await this.deleteByUserId(this.getClothingItemCollectionName(), userId);
  }

  private async upsertVector(
    collectionName: string,
    pointId: string,
    vector: number[],
    payload:
      | FaceVectorPayload
      | FashionDnaVectorPayload
      | RecommendationVectorPayload
      | ClothingItemVectorPayload,
  ): Promise<void> {
    await this.getClient().upsert(collectionName, {
      wait: true,
      points: [{ id: pointId, vector, payload: payload as unknown as Record<string, unknown> }],
    });
  }

  private async searchVectors(collectionName: string, vector: number[], limit: number) {
    return this.getClient().search(collectionName, {
      vector,
      limit,
      with_payload: true,
      score_threshold: this.getSimilarityThreshold(),
    });
  }

  private async deleteByUserId(collectionName: string, userId: string): Promise<void> {
    await this.getClient().delete(collectionName, {
      wait: true,
      filter: { must: [{ key: 'user_id', match: { value: userId } }] },
    });
  }

  private logConnectionError(message: string, error: unknown, attempt?: number): void {
    const prefix = attempt ? `${message} (attempt ${attempt}/${CONNECT_RETRIES})` : message;

    if (error instanceof Error) {
      this.logger.error(`${prefix}: ${error.message}`, error.stack);
      return;
    }

    this.logger.error(`${prefix}: ${JSON.stringify(error)}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
