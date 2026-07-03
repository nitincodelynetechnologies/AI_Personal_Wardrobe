import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { PostgresService } from '../database/postgres.service';
import { FashionDnaService } from '../fashion-dna/fashion-dna.service';
import { UsersService } from '../users/users.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CombinedProfileResponse,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserPreferencesRecord,
  UserProfileRecord,
} from './interfaces/profile.interface';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly postgresService: PostgresService,
    private readonly fashionDnaService: FashionDnaService,
    private readonly usersService: UsersService,
  ) {}

  async getCombinedProfile(userId: string): Promise<CombinedProfileResponse> {
    const [user, profile, preferences] = await Promise.all([
      this.usersService.findById(userId),
      this.findProfileByUserId(userId),
      this.findPreferencesByUserId(userId),
    ]);

    return {
      name: user.name ?? null,
      profile,
      preferences,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<CombinedProfileResponse> {
    this.ensureDatabaseReady();

    if (dto.name !== undefined) {
      await this.usersService.updateUserName(userId, dto.name);
    }

    const hasProfileFields =
      dto.gender !== undefined ||
      dto.age !== undefined ||
      dto.height !== undefined ||
      dto.weight !== undefined ||
      dto.body_type !== undefined ||
      dto.skin_tone !== undefined;

    if (hasProfileFields) {
      const existing = await this.findProfileByUserId(userId);
      const merged = this.mergeProfile(existing, dto);
      await this.upsertProfile(userId, merged);
      this.logger.log(`Profile updated for user ${userId}`);
    }

    return this.getCombinedProfile(userId);
  }

  mergeProfile(
    existing: UserProfileRecord | null,
    dto: UpdateProfileInput,
  ): UpdateProfileInput {
    const existingHeight =
      existing?.height != null ? Number(existing.height) : undefined;
    const existingWeight =
      existing?.weight != null ? Number(existing.weight) : undefined;

    return {
      gender: dto.gender ?? existing?.gender ?? undefined,
      age: dto.age ?? existing?.age ?? undefined,
      height: dto.height ?? existingHeight,
      weight: dto.weight ?? existingWeight,
      body_type: dto.body_type ?? existing?.body_type ?? undefined,
      skin_tone: dto.skin_tone ?? existing?.skin_tone ?? undefined,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    this.ensureDatabaseReady();
    const existing = await this.findPreferencesByUserId(userId);
    const merged = this.mergePreferences(existing, dto);

    const preferences = await this.upsertPreferences(userId, merged);
    const fashionDna = await this.fashionDnaService.recalculateFromPreferences(
      userId,
      preferences,
    );

    this.logger.log(`Preferences updated for user ${userId}`);

    return {
      success: true,
      preferences,
      fashion_dna: {
        id: fashionDna.id,
        style_score: fashionDna.style_score,
        lifestyle_score: fashionDna.lifestyle_score,
        fashion_style: preferences.fashion_style,
      },
    };
  }

  mergePreferences(
    existing: UserPreferencesRecord | null,
    dto: UpdatePreferencesInput,
  ): UpdatePreferencesInput {
    return {
      favorite_colors: dto.favorite_colors ?? existing?.favorite_colors ?? [],
      favorite_brands: dto.favorite_brands ?? existing?.favorite_brands ?? [],
      budget_range: dto.budget_range ?? existing?.budget_range ?? undefined,
      fashion_style: dto.fashion_style ?? existing?.fashion_style ?? undefined,
    };
  }

  private async upsertProfile(userId: string, input: UpdateProfileInput): Promise<UserProfileRecord> {
    const result = await this.postgresService.query<UserProfileRecord>(
      `INSERT INTO ${POSTGRES_TABLES.USER_PROFILES}
         (user_id, gender, age, height, weight, body_type, skin_tone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         gender = EXCLUDED.gender,
         age = EXCLUDED.age,
         height = EXCLUDED.height,
         weight = EXCLUDED.weight,
         body_type = EXCLUDED.body_type,
         skin_tone = EXCLUDED.skin_tone,
         updated_at = NOW()
       RETURNING id, user_id, gender, age, height, weight, body_type, skin_tone, created_at, updated_at`,
      [
        userId,
        input.gender ?? null,
        input.age ?? null,
        input.height ?? null,
        input.weight ?? null,
        input.body_type ?? null,
        input.skin_tone ?? null,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Unable to persist user profile');
    }

    return row;
  }

  private async findProfileByUserId(userId: string): Promise<UserProfileRecord | null> {
    const result = await this.postgresService.query<UserProfileRecord>(
      `SELECT id, user_id, gender, age, height, weight, body_type, skin_tone, created_at, updated_at
       FROM ${POSTGRES_TABLES.USER_PROFILES}
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] ?? null;
  }

  private async findPreferencesByUserId(
    userId: string,
  ): Promise<UserPreferencesRecord | null> {
    const result = await this.postgresService.query<UserPreferencesRecord>(
      `SELECT id, user_id, favorite_colors, favorite_brands, budget_range, fashion_style, created_at, updated_at
       FROM ${POSTGRES_TABLES.USER_PREFERENCES}
       WHERE user_id = $1`,
      [userId],
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      ...row,
      favorite_colors: this.normalizeStringArray(row.favorite_colors),
      favorite_brands: this.normalizeStringArray(row.favorite_brands),
    };
  }

  private async upsertPreferences(
    userId: string,
    input: UpdatePreferencesInput,
  ): Promise<UserPreferencesRecord> {
    const result = await this.postgresService.query<UserPreferencesRecord>(
      `INSERT INTO ${POSTGRES_TABLES.USER_PREFERENCES}
         (user_id, favorite_colors, favorite_brands, budget_range, fashion_style)
       VALUES ($1, $2::jsonb, $3::jsonb, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         favorite_colors = EXCLUDED.favorite_colors,
         favorite_brands = EXCLUDED.favorite_brands,
         budget_range = EXCLUDED.budget_range,
         fashion_style = EXCLUDED.fashion_style,
         updated_at = NOW()
       RETURNING id, user_id, favorite_colors, favorite_brands, budget_range, fashion_style, created_at, updated_at`,
      [
        userId,
        JSON.stringify(input.favorite_colors ?? []),
        JSON.stringify(input.favorite_brands ?? []),
        input.budget_range ?? null,
        input.fashion_style ?? null,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Unable to persist user preferences');
    }

    return {
      ...row,
      favorite_colors: this.normalizeStringArray(row.favorite_colors),
      favorite_brands: this.normalizeStringArray(row.favorite_brands),
    };
  }

  private normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    return [];
  }

  private ensureDatabaseReady(): void {
    if (!this.postgresService.isReady()) {
      throw new ServiceUnavailableException(
        'Database is offline. Start Docker Desktop, then run: docker compose up -d postgres',
      );
    }
  }
}
