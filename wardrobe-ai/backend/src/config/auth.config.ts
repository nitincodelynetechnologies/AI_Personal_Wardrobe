import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'change_me_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  faceServiceUrl: process.env.FACE_SERVICE_URL || 'http://localhost:8000',
  faceServiceMock: process.env.FACE_SERVICE_MOCK !== 'false',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
}));
