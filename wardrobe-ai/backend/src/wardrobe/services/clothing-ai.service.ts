import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import {
  isStylistConnectionError,
  STYLIST_OFFLINE_MESSAGE,
  toStylistUnavailableException,
} from '../../stylist/stylist-http.util';
import { CLOTHING_CATEGORIES } from '../constants/wardrobe.constants';

export interface ClothingAnalysisResult {
  category: string;
  color_hex: string;
  embedding: number[];
}

export interface ClothingAnalysisHints {
  category?: string;
  color_hex?: string;
}

const VECTOR_SIZE = 512;
const MOCK_CATEGORIES = ['Top', 'Bottom', 'Footwear'] as const;
const DEFAULT_MOCK_COLOR = '#6B7280';

@Injectable()
export class ClothingAiService {
  private readonly logger = new Logger(ClothingAiService.name);

  constructor(private readonly configService: ConfigService) {}

  async analyzeClothing(
    buffer: Buffer,
    hints: ClothingAnalysisHints = {},
  ): Promise<ClothingAnalysisResult> {
    const useMock = this.configService.get<boolean>('stylist.serviceMock') === true;

    if (useMock) {
      this.logger.debug('Using mock clothing analysis (CLOTHING_SERVICE_MOCK=true)');
      return this.mockAnalysis(buffer, hints);
    }

    try {
      return await this.callStylistAnalyze(buffer);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (isStylistConnectionError(error)) {
        this.logger.warn(
          'Stylist service unavailable during clothing analysis — using local mock fallback',
        );
        return this.mockAnalysis(buffer, hints);
      }

      this.logger.error('Unexpected clothing analysis failure', error);
      throw toStylistUnavailableException(error);
    }
  }

  async removeBackground(buffer: Buffer): Promise<Buffer> {
    const useMock = this.configService.get<boolean>('stylist.serviceMock') === true;
    if (useMock) {
      return buffer;
    }

    const baseUrl = this.configService.get<string>('stylist.serviceUrl');
    const timeoutMs = this.configService.get<number>('stylist.bgRemovalTimeoutMs') ?? 45000;
    const formData = new FormData();
    formData.append('image', new Blob([new Uint8Array(buffer)]), 'clothing.jpg');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/v1/clothing/remove-background`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(`Stylist background removal error: ${response.status} ${errorBody}`);
        throw new Error(`Background removal failed with status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer.byteLength) {
        throw new Error('Background removal returned an empty image');
      }

      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (isStylistConnectionError(error)) {
        this.logger.warn('Stylist service unavailable during background removal', error);
      } else {
        this.logger.warn('Background removal request failed', error);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callStylistAnalyze(buffer: Buffer): Promise<ClothingAnalysisResult> {
    const baseUrl = this.configService.get<string>('stylist.serviceUrl');
    const timeoutMs = this.configService.get<number>('stylist.timeoutMs') ?? 15000;
    const formData = new FormData();
    formData.append('image', new Blob([new Uint8Array(buffer)]), 'clothing.jpg');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/v1/clothing/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(`Stylist analyze error: ${response.status} ${errorBody}`);
        throw new ServiceUnavailableException(STYLIST_OFFLINE_MESSAGE);
      }

      return (await response.json()) as ClothingAnalysisResult;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (isStylistConnectionError(error)) {
        this.logger.error('Stylist service connection failed during clothing analysis', error);
        throw new ServiceUnavailableException(STYLIST_OFFLINE_MESSAGE);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private mockAnalysis(buffer: Buffer, hints: ClothingAnalysisHints): ClothingAnalysisResult {
    return {
      category: this.resolveMockCategory(buffer, hints.category),
      color_hex: hints.color_hex ?? DEFAULT_MOCK_COLOR,
      embedding: this.mockEmbedding(buffer),
    };
  }

  private resolveMockCategory(buffer: Buffer, hintCategory?: string): string {
    if (
      hintCategory &&
      CLOTHING_CATEGORIES.includes(hintCategory as (typeof CLOTHING_CATEGORIES)[number])
    ) {
      return hintCategory;
    }

    const digest = createHash('sha256').update(buffer).digest('hex');
    return MOCK_CATEGORIES[parseInt(digest.slice(0, 8), 16) % MOCK_CATEGORIES.length];
  }

  /** Deterministic 512-dim unit vector derived from image bytes (matches stylist mock). */
  private mockEmbedding(buffer: Buffer): number[] {
    const hash = createHash('sha256').update(buffer).digest();
    const vector = new Array<number>(VECTOR_SIZE);

    for (let i = 0; i < VECTOR_SIZE; i++) {
      vector[i] = hash[i % hash.length] / 127.5 - 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    return norm > 0 ? vector.map((value) => value / norm) : new Array(VECTOR_SIZE).fill(0);
  }
}
