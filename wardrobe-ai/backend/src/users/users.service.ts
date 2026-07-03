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
      `INSERT INTO wardrobe.users (email, mobile, password_hash, status, name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, mobile, name, status, created_at`,
      [
        input.email ?? null,
        input.mobile ?? null,
        passwordHash,
        input.status ?? 'active',
        input.name?.trim() || null,
      ],
    );

    return result.rows[0] as PublicUser;
  }

  async findById(id: string): Promise<PublicUser> {
    const result = await this.postgresService.query<UserRecord>(
      `SELECT id, email, mobile, name, status, created_at
       FROM wardrobe.users WHERE id = $1 AND status <> 'deleted'`,
      [id],
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundException('User not found');
    return user as PublicUser;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.postgresService.query<UserRecord>(
      `SELECT id, email, mobile, name, password_hash, status, created_at, updated_at
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

  async listActiveUsers(): Promise<PublicUser[]> {
    const result = await this.postgresService.query<PublicUser>(
      `SELECT id, email, mobile, name, status, created_at
       FROM wardrobe.users
       WHERE status <> 'deleted'
       ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async updateUserName(userId: string, name: string | null): Promise<PublicUser> {
    const trimmed = name?.trim() || null;
    const result = await this.postgresService.query<PublicUser>(
      `UPDATE wardrobe.users
       SET name = $2, updated_at = NOW()
       WHERE id = $1 AND status <> 'deleted'
       RETURNING id, email, mobile, name, status, created_at`,
      [userId, trimmed],
    );

    const user = result.rows[0];
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUserById(id: string): Promise<void> {
    const result = await this.postgresService.query<{ id: string }>(
      `DELETE FROM wardrobe.users WHERE id = $1 RETURNING id`,
      [id],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('User not found');
    }
  }
}
