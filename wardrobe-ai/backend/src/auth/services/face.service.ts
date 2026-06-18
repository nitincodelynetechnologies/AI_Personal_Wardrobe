import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

const VECTOR_SIZE = 512;

@Injectable()
export class FaceService {
  private readonly logger = new Logger(FaceService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateEmbedding(imageBuffers: Buffer[]): Promise<number[]> {
    const useMock = this.configService.get<boolean>('auth.faceServiceMock') !== false;

    if (useMock) {
      this.logger.debug('Using mock face embedding (FACE_SERVICE_MOCK=true)');
      return this.mockEmbedding(imageBuffers);
    }

    return this.callPythonFaceService(imageBuffers);
  }

  /** Deterministic 512-dim unit vector derived from image bytes (mock). */
  private mockEmbedding(buffers: Buffer[]): number[] {
    const combined = Buffer.concat(buffers);
    const hash = createHash('sha256').update(combined).digest();
    const vector = new Array<number>(VECTOR_SIZE);

    for (let i = 0; i < VECTOR_SIZE; i++) {
      vector[i] = (hash[i % hash.length] / 127.5) - 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map((v) => v / norm);
  }

  /** Placeholder for upcoming Python FastAPI face service integration. */
  private async callPythonFaceService(buffers: Buffer[]): Promise<number[]> {
    const baseUrl = this.configService.get<string>('auth.faceServiceUrl');
    const formData = new FormData();
    buffers.forEach((buf, i) => {
      formData.append('images', new Blob([new Uint8Array(buf)]), `face_${i}.jpg`);
    });

    const response = await fetch(`${baseUrl}/embed`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Face service error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }
}
