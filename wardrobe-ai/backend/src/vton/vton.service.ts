import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isStylistConnectionError } from '../stylist/stylist-http.util';

export interface VtonGenerateResult {
  success: boolean;
  result_image_url?: string;
  mock?: boolean;
  message?: string;
  error?: string;
}

@Injectable()
export class VtonService {
  private readonly logger = new Logger(VtonService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateTryOn(
    userImage: Express.Multer.File,
    garmentImage: Express.Multer.File,
    garmentDescription?: string,
  ): Promise<VtonGenerateResult> {
    if (!userImage?.buffer?.length) {
      throw new BadRequestException('user_image is required');
    }
    if (!garmentImage?.buffer?.length) {
      throw new BadRequestException('garment_image is required');
    }

    const useMock = this.configService.get<boolean>('vton.serviceMock') === true;

    if (useMock) {
      this.logger.debug('Using NestJS VTON mock (VTON_MOCK=true)');
      return this.buildMockResult(userImage);
    }

    try {
      return await this.callPythonVton(userImage, garmentImage, garmentDescription);
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof BadRequestException) {
        throw error;
      }

      if (isStylistConnectionError(error)) {
        this.logger.warn(
          'VTON Python service unavailable — falling back to NestJS mock response',
        );
        return this.buildMockResult(userImage);
      }

      this.logger.error('VTON generation failed', error as Error);
      throw new ServiceUnavailableException(
        'Virtual try-on failed. Ensure vton-service is running on port 8002.',
      );
    }
  }

  private buildMockResult(userImage: Express.Multer.File): VtonGenerateResult {
    const mime = userImage.mimetype?.startsWith('image/') ? userImage.mimetype : 'image/jpeg';
    const base64 = userImage.buffer.toString('base64');

    return {
      success: true,
      mock: true,
      result_image_url: `data:${mime};base64,${base64}`,
      message: 'VTON mock mode — start vton-service with VTON_MOCK=false for real IDM-VTON',
    };
  }

  private async callPythonVton(
    userImage: Express.Multer.File,
    garmentImage: Express.Multer.File,
    garmentDescription?: string,
  ): Promise<VtonGenerateResult> {
    const baseUrl = this.configService.get<string>('vton.serviceUrl');
    const timeoutMs = this.configService.get<number>('vton.timeoutMs') ?? 180000;

    const formData = new FormData();
    formData.append(
      'user_image',
      new Blob([new Uint8Array(userImage.buffer)], { type: userImage.mimetype || 'image/jpeg' }),
      userImage.originalname || 'user-body.jpg',
    );
    formData.append(
      'garment_image',
      new Blob([new Uint8Array(garmentImage.buffer)], {
        type: garmentImage.mimetype || 'image/jpeg',
      }),
      garmentImage.originalname || 'garment.jpg',
    );
    formData.append('garment_description', garmentDescription?.trim() || 'A stylish garment');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/api/try-on`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      let payload: VtonGenerateResult;
      try {
        payload = (await response.json()) as VtonGenerateResult;
      } catch {
        throw new ServiceUnavailableException('VTON service returned an invalid response');
      }

      if (!response.ok || !payload.success) {
        const message = payload.error || 'Virtual try-on generation failed';
        this.logger.warn(`VTON service error: ${message}`);
        throw new ServiceUnavailableException(message);
      }

      return payload;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('Virtual try-on timed out. Please try again.');
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
