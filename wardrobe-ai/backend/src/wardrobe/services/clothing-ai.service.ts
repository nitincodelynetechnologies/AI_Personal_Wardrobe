import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

const VECTOR_SIZE = 512;

@Injectable()
export class ClothingAiService {
  private readonly logger = new Logger(ClothingAiService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateEmbedding(imageBuffer: Buffer): Promise<number[]> {
    const useMock = this.configService.get<boolean>('wardrobe.clothingServiceMock') !== false;

    if (useMock) {
      this.logger.debug('Using mock clothing embedding (CLOTHING_SERVICE_MOCK=true)');
      return this.mockEmbedding(imageBuffer);
    }

    return this.callPythonClothingService(imageBuffer);
  }

  /** Deterministic 512-dim unit vector derived from image bytes (mock). */
  private mockEmbedding(buffer: Buffer): number[] {
    const hash = createHash('sha256').update(buffer).update('clothing-embed-v1').digest();
    const vector = new Array<number>(VECTOR_SIZE);

    for (let i = 0; i < VECTOR_SIZE; i += 1) {
      vector[i] = (hash[i % hash.length] / 127.5) - 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    return vector.map((value) => value / norm);
  }

  /** Placeholder for upcoming Python clothing embedding service. */
  private async callPythonClothingService(buffer: Buffer): Promise<number[]> {
    const baseUrl = this.configService.get<string>('wardrobe.clothingServiceUrl');
    const formData = new FormData();
    formData.append('image', new Blob([new Uint8Array(buffer)]), 'clothing.jpg');

    const response = await fetch(`${baseUrl}/v1/clothing/embed`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Clothing AI service error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }
}
