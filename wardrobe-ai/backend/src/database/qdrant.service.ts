import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { FaceVectorPayload } from '../users/interfaces/user.interface';

@Injectable()
export class QdrantService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      const url = this.configService.get<string>('database.qdrant.url');
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
        `Qdrant unavailable — start Docker: docker compose up -d (${(error as Error).message})`,
      );
    }
  }

  onModuleDestroy(): void {
    this.client = null;
  }

  private getClient(): QdrantClient {
    if (!this.client) throw new Error('Qdrant client is not initialized');
    return this.client;
  }

  getCollectionName(): string {
    return this.configService.get<string>('database.qdrant.collectionFaces') ?? 'users_face_vectors';
  }

  getSimilarityThreshold(): number {
    return this.configService.get<number>('database.qdrant.similarityThreshold') ?? 0.75;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getClient().getCollections();
      return true;
    } catch {
      return false;
    }
  }

  async upsertFaceVector(
    pointId: string,
    vector: number[],
    payload: FaceVectorPayload,
  ): Promise<void> {
    await this.getClient().upsert(this.getCollectionName(), {
      wait: true,
      points: [{ id: pointId, vector, payload: payload as unknown as Record<string, unknown> }],
    });
  }

  async searchFaceVectors(vector: number[], limit = 1) {
    return this.getClient().search(this.getCollectionName(), {
      vector,
      limit,
      with_payload: true,
      score_threshold: this.getSimilarityThreshold(),
    });
  }

  async deleteFaceByUserId(userId: string): Promise<void> {
    await this.getClient().delete(this.getCollectionName(), {
      wait: true,
      filter: { must: [{ key: 'user_id', match: { value: userId } }] },
    });
  }
}
