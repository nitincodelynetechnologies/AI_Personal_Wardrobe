import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { PostgresService } from '../database/postgres.service';
import { QdrantService } from '../database/qdrant.service';
import { MIME_TO_EXTENSION } from './constants/wardrobe.constants';
import { UploadClothingDto } from './dto/upload-clothing.dto';
import { ClothingItemRecord } from './interfaces/clothing-item.interface';
import { ClothingAiService } from './services/clothing-ai.service';

const CLOTHING_ITEM_COLUMNS =
  'id, user_id, image_url, category, sub_category, color_hex, season, is_favorite, created_at, updated_at';

@Injectable()
export class WardrobeService {
  private readonly logger = new Logger(WardrobeService.name);

  constructor(
    private readonly postgresService: PostgresService,
    private readonly qdrantService: QdrantService,
    private readonly clothingAiService: ClothingAiService,
    private readonly configService: ConfigService,
  ) {}

  async uploadClothing(
    userId: string,
    file: Express.Multer.File | undefined,
    dto: UploadClothingDto,
  ): Promise<ClothingItemRecord> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    this.postgresService.assertReady();
    this.qdrantService.assertReady();

    const imageUrl = await this.persistImage(userId, file);
    let item: ClothingItemRecord | null = null;

    try {
      const embedding = await this.clothingAiService.generateEmbedding(file.buffer);
      item = await this.insertClothingItem(userId, imageUrl, dto);

      await this.qdrantService.upsertClothingItemVector(item.id, embedding, {
        user_id: userId,
        clothing_id: item.id,
        category: item.category,
        color_hex: item.color_hex ?? undefined,
      });

      this.logger.log(`Clothing item uploaded for user ${userId}: ${item.id}`);
      return item;
    } catch (error) {
      await this.cleanupFailedUpload(imageUrl, item?.id);
      throw error;
    }
  }

  async getItemsByUserId(userId: string): Promise<ClothingItemRecord[]> {
    this.postgresService.assertReady();

    const result = await this.postgresService.query<ClothingItemRecord>(
      `SELECT ${CLOTHING_ITEM_COLUMNS}
       FROM ${POSTGRES_TABLES.CLOTHING_ITEMS}
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows;
  }

  private async insertClothingItem(
    userId: string,
    imageUrl: string,
    dto: UploadClothingDto,
  ): Promise<ClothingItemRecord> {
    const result = await this.postgresService.query<ClothingItemRecord>(
      `INSERT INTO ${POSTGRES_TABLES.CLOTHING_ITEMS}
         (user_id, image_url, category, sub_category, color_hex, season)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${CLOTHING_ITEM_COLUMNS}`,
      [
        userId,
        imageUrl,
        dto.category,
        dto.sub_category ?? null,
        dto.color_hex ?? null,
        dto.season ?? 'All',
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new ServiceUnavailableException('Unable to save clothing item');
    }

    return row;
  }

  private async persistImage(userId: string, file: Express.Multer.File): Promise<string> {
    const extension = MIME_TO_EXTENSION[file.mimetype];
    if (!extension) {
      throw new BadRequestException('Unsupported image type');
    }

    const uploadRoot = this.configService.get<string>('wardrobe.uploadDir');
    const userDir = join(uploadRoot!, userId);
    await mkdir(userDir, { recursive: true });

    const filename = `${randomUUID()}${extension}`;
    const absolutePath = join(userDir, filename);
    await writeFile(absolutePath, file.buffer);

    return `/uploads/wardrobe/${userId}/${filename}`;
  }

  private async cleanupFailedUpload(imageUrl: string, itemId?: string): Promise<void> {
    const uploadRoot = this.configService.get<string>('wardrobe.uploadDir');
    const relativePath = imageUrl.replace('/uploads/wardrobe/', '');
    const absolutePath = join(uploadRoot!, ...relativePath.split('/'));

    await unlink(absolutePath).catch(() => undefined);

    if (itemId) {
      await this.postgresService
        .query(`DELETE FROM ${POSTGRES_TABLES.CLOTHING_ITEMS} WHERE id = $1`, [itemId])
        .catch(() => undefined);
    }
  }
}
