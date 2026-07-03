import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

const VECTOR_SIZE = 512;

function isCloudProductionDeploy(): boolean {
  return (
    process.env.RENDER === 'true' ||
    Boolean(process.env.RENDER_EXTERNAL_URL) ||
    Boolean(process.env.RAILWAY_ENVIRONMENT)
  );
}

interface FaceServiceErrorBody {
  detail?: {
    code?: string;
    detail?: string;
  };
}

@Injectable()
export class FaceService {
  private readonly logger = new Logger(FaceService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateEmbedding(
    imageBuffers: Buffer[],
    mimeType = 'image/jpeg',
  ): Promise<number[]> {
    const useMock = this.configService.get<boolean>('auth.faceServiceMock') === true;

    if (useMock) {
      if (isCloudProductionDeploy()) {
        this.logger.warn(
          'FACE_SERVICE_MOCK is enabled on a cloud deploy. Login frames will not match registration unless the image bytes are identical. Set FACE_SERVICE_MOCK=false and configure FACE_SERVICE_URL.',
        );
      }
      this.logger.debug('Using mock face embedding (FACE_SERVICE_MOCK=true)');
      return this.mockEmbedding(imageBuffers);
    }

    try {
      return await this.callPythonFaceService(imageBuffers, mimeType);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error('Unexpected face embedding failure', error as Error);
      throw new ServiceUnavailableException(
        'Face verification is temporarily unavailable. Try again or use email login.',
      );
    }
  }

  /** Deterministic 512-dim unit vector derived from image bytes (mock). */
  private mockEmbedding(buffers: Buffer[]): number[] {
    const combined = Buffer.concat(buffers);
    const hash = createHash('sha256').update(combined).digest();
    const vector = new Array<number>(VECTOR_SIZE);

    for (let i = 0; i < VECTOR_SIZE; i++) {
      vector[i] = hash[i % hash.length] / 127.5 - 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    return vector.map((value) => value / norm);
  }

  private async callPythonFaceService(
    buffers: Buffer[],
    mimeType = 'image/jpeg',
  ): Promise<number[]> {
    const baseUrl = this.normalizeFaceServiceBaseUrl(
      this.configService.get<string>('auth.faceServiceUrl'),
    );

    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'Face verification is not configured. Set FACE_SERVICE_URL to your deployed face-service URL.',
      );
    }

    if (isCloudProductionDeploy() && /localhost|127\.0\.0\.1/i.test(baseUrl)) {
      throw new ServiceUnavailableException(
        'FACE_SERVICE_URL points to localhost on Render. Set it to your public face-service URL.',
      );
    }

    this.logger.debug(
      `Calling face-service embed (${buffers.reduce((sum, buffer) => sum + buffer.length, 0)} bytes across ${buffers.length} image(s))`,
    );

    const timeoutMs = this.configService.get<number>('auth.faceServiceTimeoutMs') ?? 10000;
    const normalizedMime = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
    const formData = new FormData();

    buffers.forEach((buffer, index) => {
      formData.append(
        'images',
        new Blob([new Uint8Array(buffer)], { type: normalizedMime }),
        `face_${index}.jpg`,
      );
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;

    try {
      response = await fetch(`${baseUrl}/v1/face/embed`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'AbortError'
          ? 'Face verification timed out. Please try again.'
          : 'Face AI service is offline. Start face-service or set FACE_SERVICE_MOCK=true for local dev.';

      this.logger.error(`Face service request failed: ${message}`, error as Error);
      throw new ServiceUnavailableException(message);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let parsed: FaceServiceErrorBody = {};

      try {
        parsed = JSON.parse(errorBody) as FaceServiceErrorBody;
      } catch {
        // Keep empty body when face-service does not return JSON.
      }

      const errorCode = parsed.detail?.code;
      const errorDetail = parsed.detail?.detail;

      this.logger.warn(`Face service error: ${response.status} ${errorBody}`);

      if (response.status === 400) {
        if (errorCode === 'NO_FACE_DETECTED') {
          throw new BadRequestException(
            errorDetail || 'No face detected. Center your face in the frame and try again.',
          );
        }

        if (errorCode === 'MULTIPLE_FACES_DETECTED') {
          throw new BadRequestException(
            errorDetail || 'Multiple faces detected. Only one face should be visible.',
          );
        }

        throw new BadRequestException(
          errorDetail || 'Invalid face capture. Please try again with better lighting.',
        );
      }

      throw new ServiceUnavailableException(
        errorDetail || 'Face verification service returned an error. Please try again.',
      );
    }

    const data = (await response.json()) as { embedding: number[] };

    if (!Array.isArray(data.embedding) || data.embedding.length !== VECTOR_SIZE) {
      throw new ServiceUnavailableException('Face verification returned an invalid embedding.');
    }

    return data.embedding;
  }

  private normalizeFaceServiceBaseUrl(rawUrl: string | undefined): string | null {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed.replace(/\/$/, '');
    }

    return `https://${trimmed.replace(/\/$/, '')}`;
  }
}
