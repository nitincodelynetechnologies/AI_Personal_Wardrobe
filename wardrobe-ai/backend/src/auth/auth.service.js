const {
  BadRequestException,
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
} = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { JwtService } = require('@nestjs/jwt');
const { QdrantService } = require('../database/qdrant.service');
const { UsersService } = require('../users/users.service');
const { FaceService } = require('./services/face.service');

@Injectable()
class AuthService {
  constructor(
    @Inject(UsersService) usersService,
    @Inject(QdrantService) qdrantService,
    @Inject(FaceService) faceService,
    @Inject(JwtService) jwtService,
    @Inject(ConfigService) configService,
  ) {
    this.usersService = usersService;
    this.qdrantService = qdrantService;
    this.faceService = faceService;
    this.jwtService = jwtService;
    this.configService = configService;
    this.logger = new Logger(AuthService.name);
  }

  async registerWithFace(dto, files) {
    this.validateRegistrationImages(files);

    if (!dto.email && !dto.mobile) {
      throw new BadRequestException('Either email or mobile is required');
    }

    const user = await this.usersService.createUser({
      email: dto.email,
      mobile: dto.mobile,
      password: dto.password,
      status: 'active',
    });

    const frontBuffer = files.front[0].buffer;
    const embedding = await this.faceService.generateEmbedding([frontBuffer]);

    await this.qdrantService.upsertFaceVector(user.id, embedding, {
      user_id: user.id,
      name: dto.name ?? null,
      email: dto.email ?? user.email,
      avatar_url: dto.avatar_url ?? null,
    });

    const jwt_token = await this.signToken(user);

    this.logger.log(`Face registration completed for user ${user.id}`);

    return {
      success: true,
      message: 'Face registration completed successfully',
      user,
      jwt_token,
    };
  }

  async loginWithFace(faceFile) {
    if (!faceFile?.buffer?.length) {
      throw new BadRequestException('Face image is required');
    }

    const embedding = await this.faceService.generateEmbedding([faceFile.buffer]);
    const matches = await this.qdrantService.searchFaceVectors(embedding, 1);

    if (!matches.length) {
      throw new UnauthorizedException('No matching face found');
    }

    const topMatch = matches[0];
    const userId = topMatch.payload?.user_id;

    if (!userId) {
      throw new UnauthorizedException('Invalid face vector payload');
    }

    const user = await this.usersService.findById(userId);

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    const jwt_token = await this.signToken(user);

    this.logger.log(`Face login successful for user ${user.id} (score: ${topMatch.score})`);

    return { success: true, jwt_token, user };
  }

  async signToken(user) {
    const secret = this.configService.get('auth.jwtSecret');
    const expiresIn = this.configService.get('auth.jwtExpiresIn') ?? '7d';

    return this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret, expiresIn },
    );
  }

  validateRegistrationImages(files) {
    const required = ['front', 'left', 'right', 'smile'];
    const missing = required.filter((key) => !files[key]?.[0]?.buffer?.length);

    if (missing.length) {
      throw new BadRequestException(`Face images required: ${missing.join(', ')}`);
    }
  }
}

module.exports = { AuthService };
