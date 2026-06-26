import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  isStylistConnectionError,
  STYLIST_OFFLINE_MESSAGE,
  toStylistUnavailableException,
} from '../../stylist/stylist-http.util';
import { ClothingItemRecord } from '../../wardrobe/interfaces/clothing-item.interface';
import { OutfitGenerationSelection } from '../interfaces/outfit.interface';

interface FashionDnaPayload {
  style_score?: number | string | null;
  lifestyle_score?: number | string | null;
  color_affinity?: Record<string, number>;
  brand_affinity?: Record<string, number>;
}

interface StylistRecommendResponse {
  top_id: string;
  bottom_id: string;
  footwear_id: string;
  style_score: number;
}

export interface OutfitComboExclude {
  top_id: string;
  bottom_id: string;
  footwear_id: string;
}

interface StylistErrorBody {
  detail?: {
    code?: string;
    detail?: string;
  };
}

@Injectable()
export class StylistService {
  private readonly logger = new Logger(StylistService.name);

  constructor(private readonly configService: ConfigService) {}

  async recommendOutfit(
    items: ClothingItemRecord[],
    seasonTag: string,
    fashionDna?: FashionDnaPayload | null,
    excludeCombos: OutfitComboExclude[] = [],
  ): Promise<OutfitGenerationSelection> {
    const baseUrl = this.configService.get<string>('stylist.serviceUrl');
    const timeoutMs = this.configService.get<number>('stylist.timeoutMs') ?? 15000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/v1/outfits/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: seasonTag,
          fashion_dna: fashionDna
            ? {
                style_score: this.toNumber(fashionDna.style_score),
                lifestyle_score: this.toNumber(fashionDna.lifestyle_score),
                color_affinity: fashionDna.color_affinity ?? {},
                brand_affinity: fashionDna.brand_affinity ?? {},
              }
            : null,
          items: items.map((item) => ({
            id: item.id,
            category: item.category,
            color_hex: item.color_hex,
            season: item.season,
          })),
          exclude_combos: excludeCombos,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(`Stylist recommend error: ${response.status} ${errorBody}`);

        let parsed: StylistErrorBody = {};
        try {
          parsed = JSON.parse(errorBody) as StylistErrorBody;
        } catch {
          // Keep default empty body when stylist does not return JSON.
        }

        const errorCode = parsed.detail?.code;
        const errorDetail = parsed.detail?.detail;

        if (response.status === 400) {
          if (errorCode === 'NO_NEW_COMBINATIONS') {
            throw new BadRequestException(
              errorDetail ||
                'No new outfit combinations available. Add more wardrobe items for variety.',
            );
          }

          if (errorCode === 'INSUFFICIENT_WARDROBE') {
            throw new BadRequestException(
              errorDetail || 'Not enough items in wardrobe to generate an outfit.',
            );
          }
        }

        throw new ServiceUnavailableException(STYLIST_OFFLINE_MESSAGE);
      }

      const data = (await response.json()) as StylistRecommendResponse;
      return {
        top_id: data.top_id,
        bottom_id: data.bottom_id,
        footwear_id: data.footwear_id,
        accessory_id: null,
        style_score: data.style_score,
        season_tag: seasonTag,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (isStylistConnectionError(error)) {
        this.logger.error('Stylist service connection failed during outfit recommendation', error);
        throw new ServiceUnavailableException(STYLIST_OFFLINE_MESSAGE);
      }

      this.logger.error('Unexpected outfit recommendation failure', error);
      throw toStylistUnavailableException(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private toNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
