import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { QdrantService } from '../database/qdrant.service';
import { PublicUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FaceRegisterDto } from './dto/face-register.dto';
import { FaceService } from './services/face.service';

export interface FaceImageFiles {
  front?: Express.Multer.File[];
  left?: Express.Multer.File[];
  right?: Express.Multer.File[];
  smile?: Express.Multer.File[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly qdrantService: QdrantService,
    private readonly faceService: FaceService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerWithFace(
    dto: FaceRegisterDto,
    files: FaceImageFiles,
  ): Promise<{ success: boolean; message: string; user: PublicUser; jwt_token: string }> {
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

    // Primary face vector derived from front capture (matches login embedding)
    const frontBuffer = files.front![0].buffer;
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

  async loginWithFace(
    faceFile: Express.Multer.File,
  ): Promise<{ success: boolean; jwt_token: string; user: PublicUser }> {
    if (!faceFile?.buffer?.length) {
      throw new BadRequestException('Face image is required');
    }

    const embedding = await this.faceService.generateEmbedding([faceFile.buffer]);
    const matches = await this.qdrantService.searchFaceVectors(embedding, 1);

    if (!matches.length) {
      throw new UnauthorizedException('No matching face found');
    }

    const topMatch = matches[0];
    const userId = topMatch.payload?.user_id as string | undefined;

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

  private async signToken(user: PublicUser): Promise<string> {
    const secret = this.configService.get<string>('auth.jwtSecret');
    const expiresIn = this.configService.get<string>('auth.jwtExpiresIn') ?? '7d';

    return this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret, expiresIn },
    );
  }

  private validateRegistrationImages(files: FaceImageFiles): void {
    const required: (keyof FaceImageFiles)[] = ['front', 'left', 'right', 'smile'];
    const missing = required.filter((key) => !files[key]?.[0]?.buffer?.length);

    if (missing.length) {
      throw new BadRequestException(
        `Face images required: ${missing.join(', ')}`,
      );
    }
  }
}
