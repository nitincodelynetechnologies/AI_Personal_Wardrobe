import { registerAs } from '@nestjs/config';
import { resolveServiceUrl } from './resolve-service-url';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'change_me_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  faceServiceUrl: resolveServiceUrl(
    process.env.FACE_SERVICE_URL,
    process.env.FACE_SERVICE_HOST,
    process.env.FACE_SERVICE_PORT,
    'localhost',
    '8000',
  ),
  faceServiceMock: process.env.FACE_SERVICE_MOCK === 'true',
  faceServiceTimeoutMs: parseInt(process.env.FACE_SERVICE_TIMEOUT_MS || '10000', 10),
  faceLoginSimilarityThreshold: parseFloat(
    process.env.FACE_LOGIN_SIMILARITY_THRESHOLD || '0.55',
  ),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
}));
