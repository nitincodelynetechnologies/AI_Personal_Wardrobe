const { Injectable, Inject, Logger } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { createHash } = require('crypto');

const VECTOR_SIZE = 512;

@Injectable()
class FaceService {
  constructor(@Inject(ConfigService) configService) {
    this.configService = configService;
    this.logger = new Logger(FaceService.name);
  }

  async generateEmbedding(imageBuffers) {
    const useMock = this.configService.get('auth.faceServiceMock') !== false;

    if (useMock) {
      this.logger.debug('Using mock face embedding (FACE_SERVICE_MOCK=true)');
      return this.mockEmbedding(imageBuffers);
    }

    return this.callPythonFaceService(imageBuffers);
  }

  /** Deterministic 512-dim unit vector derived from image bytes (mock). */
  mockEmbedding(buffers) {
    const combined = Buffer.concat(buffers);
    const hash = createHash('sha256').update(combined).digest();
    const vector = new Array(VECTOR_SIZE);

    for (let i = 0; i < VECTOR_SIZE; i++) {
      vector[i] = hash[i % hash.length] / 127.5 - 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map((v) => v / norm);
  }

  /** Placeholder for upcoming Python FastAPI face service integration. */
  async callPythonFaceService(buffers) {
    const baseUrl = this.configService.get('auth.faceServiceUrl');
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

    const data = await response.json();
    return data.embedding;
  }
}

module.exports = { FaceService };
