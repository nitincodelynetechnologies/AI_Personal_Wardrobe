import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PostgresService } from '../database/postgres.service';
import { QdrantService } from '../database/qdrant.service';
import { PublicUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FaceRegisterDto } from './dto/face-register.dto';
import { LoginDto } from './dto/login.dto';
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
    private readonly postgresService: PostgresService,
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

    this.ensureDatabasesReady();

    let user: PublicUser;

    try {
      user = await this.usersService.createUser({
        email: dto.email,
        mobile: dto.mobile,
        password: dto.password,
        status: 'active',
      });
    } catch (error) {
      this.logRegistrationFailure('PostgreSQL user INSERT failed', error);
      throw error;
    }

    const frontBuffer = files.front![0].buffer;
    let embedding: number[];

    try {
      embedding = await this.faceService.generateEmbedding(
        [frontBuffer],
        files.front![0].mimetype || 'image/jpeg',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logRegistrationFailure('Face embedding generation failed', error);
      throw new ServiceUnavailableException(
        'Unable to process face images. Please try again.',
      );
    }

    try {
      await this.qdrantService.upsertFaceVector(user.id, embedding, {
        user_id: user.id,
        name: dto.name ?? null,
        email: dto.email ?? user.email,
        avatar_url: dto.avatar_url ?? null,
      });
    } catch (error) {
      this.logRegistrationFailure('Qdrant face vector UPSERT failed', error);
      throw error;
    }

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

    this.ensureDatabasesReady();

    let embedding: number[];

    try {
      embedding = await this.faceService.generateEmbedding(
        [faceFile.buffer],
        faceFile.mimetype || 'image/jpeg',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logRegistrationFailure('Face embedding generation failed', error);
      throw new ServiceUnavailableException(
        'Unable to verify face. Please try again or use email login.',
      );
    }

    let matches;
    try {
      matches = await this.qdrantService.searchFaceVectors(embedding, 1);
    } catch (error) {
      this.logRegistrationFailure('Qdrant face vector SEARCH failed', error);
      throw error;
    }

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

  async loginWithPassword(
    dto: LoginDto,
  ): Promise<{ success: boolean; message: string; jwt_token: string; user: PublicUser }> {
    this.ensurePostgresReady();

    const userRecord = await this.usersService.findByEmail(dto.email.trim());

    if (!userRecord) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!userRecord.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, userRecord.password_hash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (userRecord.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    const user: PublicUser = {
      id: userRecord.id,
      email: userRecord.email,
      mobile: userRecord.mobile,
      status: userRecord.status,
      created_at: userRecord.created_at,
    };

    const jwt_token = await this.signToken(user);

    this.logger.log(`Password login successful for user ${user.id}`);

    return {
      success: true,
      message: 'Login successful',
      jwt_token,
      user,
    };
  }

  private ensurePostgresReady(): void {
    if (!this.postgresService.isReady()) {
      const message =
        'PostgreSQL is not connected. Start Docker: docker compose up -d postgres';
      this.logger.error(message);
      throw new ServiceUnavailableException(message);
    }
  }

  private ensureDatabasesReady(): void {
    this.ensurePostgresReady();

    if (!this.qdrantService.isReady()) {
      const message = 'Qdrant is not connected. Start Docker: docker compose up -d qdrant';
      this.logger.error(message);
      throw new ServiceUnavailableException(message);
    }
  }

  private logRegistrationFailure(context: string, error: unknown): void {
    if (error instanceof HttpException) {
      this.logger.error(`${context}: ${error.message}`);
      return;
    }

    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`, error.stack);
      console.error(`[AuthService] ${context}`, error);
      return;
    }

    this.logger.error(`${context}: ${JSON.stringify(error)}`);
    console.error(`[AuthService] ${context}`, error);
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
