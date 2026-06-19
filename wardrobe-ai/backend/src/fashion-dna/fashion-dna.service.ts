import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { PostgresService } from '../database/postgres.service';
import { QdrantService } from '../database/qdrant.service';
import { UserPreferencesRecord } from '../profile/interfaces/profile.interface';
import { FashionDnaRecord } from './interfaces/fashion-dna.interface';
import {
  calculateMockFashionDna,
  generateMockFashionVector,
} from './utils/fashion-dna.mock';

@Injectable()
export class FashionDnaService {
  private readonly logger = new Logger(FashionDnaService.name);

  constructor(
    private readonly postgresService: PostgresService,
    private readonly qdrantService: QdrantService,
    private readonly configService: ConfigService,
  ) {}

  async getByUserId(userId: string) {
    const result = await this.postgresService.query<
      FashionDnaRecord & { fashion_style: string | null }
    >(
      `SELECT fd.id, fd.user_id, fd.style_score, fd.color_affinity, fd.brand_affinity,
              fd.lifestyle_score, fd.created_at, fd.updated_at, up.fashion_style
       FROM ${POSTGRES_TABLES.FASHION_DNA} fd
       LEFT JOIN ${POSTGRES_TABLES.USER_PREFERENCES} up ON up.user_id = fd.user_id
       WHERE fd.user_id = $1`,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException(
        'Fashion DNA profile not found. Update preferences to generate one.',
      );
    }

    return this.toResponse(
      {
        ...row,
        color_affinity: this.normalizeAffinity(row.color_affinity),
        brand_affinity: this.normalizeAffinity(row.brand_affinity),
      },
      row.fashion_style,
    );
  }

  async recalculateFromPreferences(
    userId: string,
    preferences: UserPreferencesRecord,
  ): Promise<FashionDnaRecord> {
    const mock = calculateMockFashionDna(preferences);
    const record = await this.upsertFashionDna(userId, mock);
    const vector = generateMockFashionVector(
      `${userId}:${JSON.stringify(mock)}:${preferences.fashion_style ?? ''}`,
      this.configService,
    );

    await this.qdrantService.upsertFashionDnaVector(userId, vector, {
      user_id: userId,
      fashion_dna_id: record.id,
      fashion_style: preferences.fashion_style ?? undefined,
      style_score: mock.style_score,
    });

    this.logger.log(`Fashion DNA recalculated for user ${userId}`);

    return record;
  }

  private async upsertFashionDna(
    userId: string,
    mock: ReturnType<typeof calculateMockFashionDna>,
  ): Promise<FashionDnaRecord> {
    const result = await this.postgresService.query<FashionDnaRecord>(
      `INSERT INTO ${POSTGRES_TABLES.FASHION_DNA}
         (user_id, style_score, color_affinity, brand_affinity, lifestyle_score)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         style_score = EXCLUDED.style_score,
         color_affinity = EXCLUDED.color_affinity,
         brand_affinity = EXCLUDED.brand_affinity,
         lifestyle_score = EXCLUDED.lifestyle_score,
         updated_at = NOW()
       RETURNING id, user_id, style_score, color_affinity, brand_affinity, lifestyle_score, created_at, updated_at`,
      [
        userId,
        mock.style_score,
        JSON.stringify(mock.color_affinity),
        JSON.stringify(mock.brand_affinity),
        mock.lifestyle_score,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Unable to persist Fashion DNA');
    }

    return {
      ...row,
      color_affinity: this.normalizeAffinity(row.color_affinity),
      brand_affinity: this.normalizeAffinity(row.brand_affinity),
    };
  }

  private toResponse(record: FashionDnaRecord, fashionStyle: string | null = null) {
    return {
      id: record.id,
      user_id: record.user_id,
      style_score: record.style_score ? Number(record.style_score) : null,
      color_affinity: record.color_affinity,
      brand_affinity: record.brand_affinity,
      lifestyle_score: record.lifestyle_score ? Number(record.lifestyle_score) : null,
      fashion_style: fashionStyle,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  private normalizeAffinity(value: unknown): Record<string, number> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number',
      ),
    );
  }
}
