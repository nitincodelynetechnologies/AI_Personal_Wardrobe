import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  isStylistConnectionError,
  STYLIST_OFFLINE_MESSAGE,
  toStylistUnavailableException,
} from '../../stylist/stylist-http.util';

export interface ClothingAnalysisResult {
  category: string;
  color_hex: string;
  embedding: number[];
}

@Injectable()
export class ClothingAiService {
  private readonly logger = new Logger(ClothingAiService.name);

  constructor(private readonly configService: ConfigService) {}

  async analyzeClothing(buffer: Buffer): Promise<ClothingAnalysisResult> {
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

      this.logger.error('Unexpected clothing analysis failure', error);
      throw toStylistUnavailableException(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  async removeBackground(buffer: Buffer): Promise<Buffer> {
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
}
