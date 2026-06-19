import { memoryStorage } from 'multer';
import { ALLOWED_IMAGE_MIME_TYPES } from '../constants/wardrobe.constants';

const DEFAULT_MAX_FILE_SIZE_MB = 5;

export function createWardrobeUploadOptions(maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB) {
  return {
    storage: memoryStorage(),
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, accept: boolean) => void,
    ) => {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        return;
      }
      cb(null, true);
    },
  };
}
