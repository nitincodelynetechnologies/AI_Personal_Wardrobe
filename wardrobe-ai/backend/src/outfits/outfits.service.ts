import {

  BadRequestException,

  Injectable,

  InternalServerErrorException,

  Logger,

  NotFoundException,

  ServiceUnavailableException,

} from '@nestjs/common';

import { POSTGRES_TABLES } from '../database/schema.registry';

import { PostgresService } from '../database/postgres.service';

import { FashionDnaService } from '../fashion-dna/fashion-dna.service';

import { ClothingItemRecord } from '../wardrobe/interfaces/clothing-item.interface';

import { WardrobeService } from '../wardrobe/wardrobe.service';

import { GenerateOutfitDto } from './dto/generate-outfit.dto';

import { OutfitRecord, PopulatedOutfit } from './interfaces/outfit.interface';

import { StylistService } from './services/stylist.service';

import { hasRequiredWardrobeCategories } from './utils/wardrobe-requirements.util';



const OUTFIT_COLUMNS =

  'id, user_id, name, top_id, bottom_id, footwear_id, accessory_id, style_score, season_tag, is_favorite, created_at, updated_at';



const CLOTHING_ITEM_JSON = `

  json_build_object(

    'id', ci.id,

    'user_id', ci.user_id,

    'image_url', ci.image_url,

    'category', ci.category,

    'sub_category', ci.sub_category,

    'color_hex', ci.color_hex,

    'season', ci.season,

    'is_favorite', ci.is_favorite,

    'created_at', ci.created_at,

    'updated_at', ci.updated_at

  )

`;



@Injectable()

export class OutfitsService {

  private readonly logger = new Logger(OutfitsService.name);



  constructor(

    private readonly postgresService: PostgresService,

    private readonly wardrobeService: WardrobeService,

    private readonly stylistService: StylistService,

    private readonly fashionDnaService: FashionDnaService,

  ) {}



  async generateOutfit(userId: string, dto: GenerateOutfitDto): Promise<PopulatedOutfit> {

    this.postgresService.assertReady();



    const wardrobeItems = await this.wardrobeService.getItemsByUserId(userId);



    if (!hasRequiredWardrobeCategories(wardrobeItems)) {

      throw new BadRequestException('Not enough items in wardrobe to generate an outfit.');

    }



    const seasonTag = dto.season ?? 'All';

    const fashionDna = await this.fashionDnaService.getByUserId(userId).catch(() => null);

    const selection = await this.stylistService.recommendOutfit(wardrobeItems, seasonTag, fashionDna);



    const result = await this.postgresService.query<OutfitRecord>(

      `INSERT INTO ${POSTGRES_TABLES.OUTFITS}

         (user_id, name, top_id, bottom_id, footwear_id, accessory_id, style_score, season_tag)

       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

       RETURNING ${OUTFIT_COLUMNS}`,

      [

        userId,

        dto.name?.trim() || null,

        selection.top_id,

        selection.bottom_id,

        selection.footwear_id,

        selection.accessory_id,

        selection.style_score,

        selection.season_tag,

      ],

    );



    const outfit = result.rows[0];

    if (!outfit) {

      throw new ServiceUnavailableException('Unable to save generated outfit');

    }



    this.logger.log(`Outfit generated for user ${userId}: ${outfit.id} (score ${outfit.style_score})`);



    const populated = await this.getOutfitById(userId, outfit.id);

    if (!populated) {

      throw new NotFoundException('Generated outfit not found');

    }



    return populated;

  }



  async getOutfitsByUserId(userId: string): Promise<PopulatedOutfit[]> {

    this.postgresService.assertReady();



    const result = await this.postgresService.query<PopulatedOutfitRow>(

      this.buildPopulatedOutfitQuery(`WHERE o.user_id = $1 ORDER BY o.created_at DESC`),

      [userId],

    );



    return result.rows.map((row) => this.mapPopulatedOutfitRow(row));

  }



  async updateOutfitFeedback(

    userId: string,

    outfitId: string,

    isFavorite: boolean,

  ): Promise<PopulatedOutfit> {

    this.postgresService.assertReady();



    try {

      const result = await this.postgresService.query<{ id: string }>(

        `UPDATE ${POSTGRES_TABLES.OUTFITS}

       SET is_favorite = $1, updated_at = NOW()

       WHERE id = $2 AND user_id = $3

       RETURNING id`,

        [isFavorite, outfitId, userId],

      );



      if (!result.rows[0]) {

        throw new NotFoundException('Outfit not found');

      }



      const populated = await this.getOutfitById(userId, outfitId);

      if (!populated) {

        throw new NotFoundException('Outfit not found');

      }



      return populated;

    } catch (error) {

      if (error instanceof NotFoundException) {

        throw error;

      }



      console.error('[OutfitsService.updateOutfitFeedback]', error);

      this.logger.error(`Failed to update outfit feedback for ${outfitId}`, error as Error);

      throw new InternalServerErrorException('Unable to update outfit feedback');

    }

  }



  async deleteOutfit(userId: string, outfitId: string): Promise<{ success: true }> {

    this.postgresService.assertReady();



    try {

      const result = await this.postgresService.query<{ id: string }>(

        `DELETE FROM ${POSTGRES_TABLES.OUTFITS}

       WHERE id = $1 AND user_id = $2

       RETURNING id`,

        [outfitId, userId],

      );



      if (!result.rows[0]) {

        throw new NotFoundException('Outfit not found');

      }



      this.logger.log(`Outfit deleted for user ${userId}: ${outfitId}`);

      return { success: true };

    } catch (error) {

      if (error instanceof NotFoundException) {

        throw error;

      }



      console.error('[OutfitsService.deleteOutfit]', error);

      this.logger.error(`Failed to delete outfit ${outfitId}`, error as Error);

      throw new InternalServerErrorException('Unable to delete outfit');

    }

  }



  private async getOutfitById(userId: string, outfitId: string): Promise<PopulatedOutfit | null> {

    const result = await this.postgresService.query<PopulatedOutfitRow>(

      this.buildPopulatedOutfitQuery(`WHERE o.user_id = $1 AND o.id = $2`),

      [userId, outfitId],

    );



    const row = result.rows[0];

    return row ? this.mapPopulatedOutfitRow(row) : null;

  }



  private buildPopulatedOutfitQuery(whereClause: string): string {

    return `

      SELECT

        o.id,

        o.user_id,

        o.name,

        o.top_id,

        o.bottom_id,

        o.footwear_id,

        o.accessory_id,

        o.style_score,

        o.season_tag,

        o.is_favorite,

        o.created_at,

        o.updated_at,

        CASE WHEN top_item.id IS NULL THEN NULL ELSE ${CLOTHING_ITEM_JSON.replace(/ci\./g, 'top_item.')} END AS top,

        CASE WHEN bottom_item.id IS NULL THEN NULL ELSE ${CLOTHING_ITEM_JSON.replace(/ci\./g, 'bottom_item.')} END AS bottom,

        CASE WHEN footwear_item.id IS NULL THEN NULL ELSE ${CLOTHING_ITEM_JSON.replace(/ci\./g, 'footwear_item.')} END AS footwear,

        CASE WHEN accessory_item.id IS NULL THEN NULL ELSE ${CLOTHING_ITEM_JSON.replace(/ci\./g, 'accessory_item.')} END AS accessory

      FROM ${POSTGRES_TABLES.OUTFITS} o

      LEFT JOIN ${POSTGRES_TABLES.CLOTHING_ITEMS} top_item ON o.top_id = top_item.id

      LEFT JOIN ${POSTGRES_TABLES.CLOTHING_ITEMS} bottom_item ON o.bottom_id = bottom_item.id

      LEFT JOIN ${POSTGRES_TABLES.CLOTHING_ITEMS} footwear_item ON o.footwear_id = footwear_item.id

      LEFT JOIN ${POSTGRES_TABLES.CLOTHING_ITEMS} accessory_item ON o.accessory_id = accessory_item.id

      ${whereClause}

    `;

  }



  private mapPopulatedOutfitRow(row: PopulatedOutfitRow): PopulatedOutfit {

    return {

      id: row.id,

      user_id: row.user_id,

      name: row.name,

      top_id: row.top_id,

      bottom_id: row.bottom_id,

      footwear_id: row.footwear_id,

      accessory_id: row.accessory_id,

      style_score: row.style_score,

      season_tag: row.season_tag,

      is_favorite: row.is_favorite,

      created_at: row.created_at,

      updated_at: row.updated_at,

      top: this.parseClothingItem(row.top),

      bottom: this.parseClothingItem(row.bottom),

      footwear: this.parseClothingItem(row.footwear),

      accessory: this.parseClothingItem(row.accessory),

    };

  }



  private parseClothingItem(value: ClothingItemRecord | null): ClothingItemRecord | null {

    if (!value || typeof value !== 'object' || !('id' in value)) {

      return null;

    }



    return value;

  }

}



interface PopulatedOutfitRow extends OutfitRecord {

  top: ClothingItemRecord | null;

  bottom: ClothingItemRecord | null;

  footwear: ClothingItemRecord | null;

  accessory: ClothingItemRecord | null;

}


