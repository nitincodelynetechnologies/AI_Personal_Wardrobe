import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PostgresService } from '../database/postgres.service';
import {
  CreateUserInput,
  PublicUser,
  UserRecord,
} from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    const rounds = this.configService.get<number>('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(input.password, rounds);

    if (input.email) {
      const existing = await this.findByEmail(input.email);
      if (existing) throw new ConflictException('Email is already registered');
    }

    if (input.mobile) {
      const existing = await this.findByMobile(input.mobile);
      if (existing) throw new ConflictException('Mobile number is already registered');
    }

    const result = await this.postgresService.query<UserRecord>(
      `INSERT INTO wardrobe.users (email, mobile, password_hash, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, mobile, status, created_at`,
      [input.email ?? null, input.mobile ?? null, passwordHash, input.status ?? 'active'],
    );

    return result.rows[0] as PublicUser;
  }

  async findById(id: string): Promise<PublicUser> {
    const result = await this.postgresService.query<UserRecord>(
      `SELECT id, email, mobile, status, created_at
       FROM wardrobe.users WHERE id = $1 AND status <> 'deleted'`,
      [id],
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundException('User not found');
    return user as PublicUser;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.postgresService.query<UserRecord>(
      `SELECT id, email, mobile, password_hash, status, created_at, updated_at
       FROM wardrobe.users WHERE LOWER(email) = LOWER($1) AND status <> 'deleted'`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findByMobile(mobile: string): Promise<UserRecord | null> {
    const result = await this.postgresService.query<UserRecord>(
      `SELECT id, email, mobile, password_hash, status, created_at, updated_at
       FROM wardrobe.users WHERE mobile = $1 AND status <> 'deleted'`,
      [mobile],
    );
    return result.rows[0] ?? null;
  }
}
