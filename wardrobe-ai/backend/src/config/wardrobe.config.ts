import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('wardrobe', () => ({
  uploadDir: process.env.WARDROBE_UPLOAD_DIR || join(process.cwd(), 'uploads', 'wardrobe'),
  maxFileSizeMb: parseInt(process.env.WARDROBE_MAX_FILE_SIZE_MB || '5', 10),
  clothingServiceUrl: process.env.CLOTHING_SERVICE_URL || 'http://localhost:8001',
  clothingServiceMock: process.env.CLOTHING_SERVICE_MOCK !== 'false',
}));
