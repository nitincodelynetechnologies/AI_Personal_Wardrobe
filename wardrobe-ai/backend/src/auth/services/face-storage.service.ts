import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { access, mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class FaceStorageService {
  private readonly logger = new Logger(FaceStorageService.name);

  constructor(private readonly configService: ConfigService) {}

  getUploadDir(): string {
    return (
      this.configService.get<string>('auth.faceUploadDir') ||
      join(process.cwd(), 'uploads', 'faces')
    );
  }

  /** Persists the registration front-face frame and returns a public `/uploads/...` path. */
  async saveRegistrationFace(
    userId: string,
    buffer: Buffer,
    mimeType = 'image/jpeg',
  ): Promise<string> {
    const extension = MIME_TO_EXTENSION[mimeType.toLowerCase()] || 'jpg';
    const userDir = join(this.getUploadDir(), userId);
    await mkdir(userDir, { recursive: true });

    const filename = `front.${extension}`;
    await writeFile(join(userDir, filename), buffer);

    return `/uploads/faces/${userId}/${filename}`;
  }

  async deleteUserFaceFiles(userId: string): Promise<void> {
    const userDir = join(this.getUploadDir(), userId);
    await rm(userDir, { recursive: true, force: true });
    this.logger.log(`Removed face image directory for user ${userId}`);
  }

  async resolveStoredFaceImageUrl(
    userId: string,
    avatarUrl?: string | null,
  ): Promise<string | null> {
    const candidates = [
      avatarUrl,
      `/uploads/faces/${userId}/front.jpg`,
      `/uploads/faces/${userId}/front.png`,
      `/uploads/faces/${userId}/front.webp`,
    ].filter((value): value is string => Boolean(value));

    for (const candidate of candidates) {
      if (!candidate.startsWith('/uploads/faces/')) {
        continue;
      }

      const relativePath = candidate.replace(/^\/uploads\/faces\//, '');
      const absolutePath = join(this.getUploadDir(), relativePath);

      try {
        await access(absolutePath);
        return candidate;
      } catch {
        // Try the next candidate path.
      }
    }

    return null;
  }
}
