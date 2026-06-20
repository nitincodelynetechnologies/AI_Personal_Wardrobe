import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { PostgresService } from '../database/postgres.service';
import { QdrantService } from '../database/qdrant.service';
import { CLOTHING_CATEGORIES, MIME_TO_EXTENSION } from './constants/wardrobe.constants';
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

    const { buffer: imageBuffer, mimetype } = await this.prepareImageForStorage(file);
    const analysis = await this.clothingAiService.analyzeClothing(imageBuffer);
    const category = this.resolveCategory(analysis.category, dto.category);
    const colorHex = analysis.color_hex || dto.color_hex || null;

    const imageUrl = await this.persistImageBuffer(userId, imageBuffer, mimetype);
    let item: ClothingItemRecord | null = null;

    try {
      item = await this.insertClothingItem(userId, imageUrl, {
        category,
        sub_category: dto.sub_category,
        color_hex: colorHex ?? undefined,
        season: dto.season,
      });

      await this.qdrantService.upsertClothingItemVector(item.id, analysis.embedding, {
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

  async deleteClothingItem(
    userId: string,
    itemId: string,
  ): Promise<{ success: true; deleted_outfit_ids: string[] }> {
    this.postgresService.assertReady();
    this.qdrantService.assertReady();

    const item = await this.getItemById(userId, itemId);
    if (!item) {
      throw new NotFoundException('Clothing item not found');
    }

    const orphanedOutfits = await this.postgresService.query<{ id: string }>(
      `DELETE FROM ${POSTGRES_TABLES.OUTFITS}
       WHERE user_id = $1
         AND $2 IN (top_id, bottom_id, footwear_id, accessory_id)
         AND (
           (CASE WHEN top_id IS NOT NULL AND top_id <> $2 THEN 1 ELSE 0 END) +
           (CASE WHEN bottom_id IS NOT NULL AND bottom_id <> $2 THEN 1 ELSE 0 END) +
           (CASE WHEN footwear_id IS NOT NULL AND footwear_id <> $2 THEN 1 ELSE 0 END) +
           (CASE WHEN accessory_id IS NOT NULL AND accessory_id <> $2 THEN 1 ELSE 0 END)
         ) = 0
       RETURNING id`,
      [userId, itemId],
    );

    await this.postgresService.query(
      `DELETE FROM ${POSTGRES_TABLES.CLOTHING_ITEMS} WHERE id = $1 AND user_id = $2`,
      [itemId, userId],
    );

    await this.qdrantService.deleteClothingItemVector(itemId).catch(() => undefined);
    await this.deleteImageFile(item.image_url);

    this.logger.log(
      `Clothing item deleted for user ${userId}: ${itemId} (orphaned outfits: ${orphanedOutfits.rows.length})`,
    );

    return {
      success: true,
      deleted_outfit_ids: orphanedOutfits.rows.map((row) => row.id),
    };
  }

  private async getItemById(userId: string, itemId: string): Promise<ClothingItemRecord | null> {
    const result = await this.postgresService.query<ClothingItemRecord>(
      `SELECT ${CLOTHING_ITEM_COLUMNS}
       FROM ${POSTGRES_TABLES.CLOTHING_ITEMS}
       WHERE id = $1 AND user_id = $2`,
      [itemId, userId],
    );

    return result.rows[0] ?? null;
  }

  private async deleteImageFile(imageUrl: string): Promise<void> {
    const uploadRoot = this.configService.get<string>('wardrobe.uploadDir');
    const relativePath = imageUrl.replace('/uploads/wardrobe/', '');
    const absolutePath = join(uploadRoot!, ...relativePath.split('/'));
    await unlink(absolutePath).catch(() => undefined);
  }

  private resolveCategory(aiCategory: string, fallbackCategory: string): string {
    if (CLOTHING_CATEGORIES.includes(aiCategory as (typeof CLOTHING_CATEGORIES)[number])) {
      return aiCategory;
    }

    this.logger.warn(`Stylist returned unsupported category "${aiCategory}", using client value`);
    return fallbackCategory;
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

  private async prepareImageForStorage(
    file: Express.Multer.File,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    try {
      const processed = await this.clothingAiService.removeBackground(file.buffer);
      return { buffer: processed, mimetype: 'image/png' };
    } catch (error) {
      this.logger.warn(
        `Background removal skipped, saving original image: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      return { buffer: file.buffer, mimetype: file.mimetype };
    }
  }

  private async persistImageBuffer(
    userId: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const extension = MIME_TO_EXTENSION[mimetype];
    if (!extension) {
      throw new BadRequestException('Unsupported image type');
    }

    const uploadRoot = this.configService.get<string>('wardrobe.uploadDir');
    const userDir = join(uploadRoot!, userId);
    await mkdir(userDir, { recursive: true });

    const filename = `${randomUUID()}${extension}`;
    const absolutePath = join(userDir, filename);
    await writeFile(absolutePath, buffer);

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
