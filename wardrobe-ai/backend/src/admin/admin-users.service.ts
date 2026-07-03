import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { rm } from 'fs/promises';
import { join } from 'path';
import { FaceStorageService } from '../auth/services/face-storage.service';
import { isAdminEmail, parseAdminEmailAllowlist } from '../auth/utils/admin-role.util';
import { QdrantService } from '../database/qdrant.service';
import { PostgresService } from '../database/postgres.service';
import { FaceVectorPayload, PublicUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';

export interface AdminRegisteredUser {
  id: string;
  email: string | null;
  mobile: string | null;
  name: string | null;
  status: PublicUser['status'];
  created_at: Date;
  face_image_url: string | null;
  has_face_vector: boolean;
}

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly postgresService: PostgresService,
    private readonly qdrantService: QdrantService,
    private readonly faceStorageService: FaceStorageService,
    private readonly configService: ConfigService,
  ) {}

  async listRegisteredUsers(): Promise<{ total: number; users: AdminRegisteredUser[] }> {
    this.postgresService.assertReady();

    const users = await this.usersService.listActiveUsers();
    const facePayloadByUserId = await this.loadFacePayloadMap();

    const enriched = await Promise.all(
      users.map(async (user) => {
        const facePayload = facePayloadByUserId.get(user.id);
        const faceImageUrl = await this.faceStorageService.resolveStoredFaceImageUrl(
          user.id,
          facePayload?.avatar_url,
        );

        return {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          name: user.name ?? facePayload?.name ?? null,
          status: user.status,
          created_at: user.created_at,
          face_image_url: faceImageUrl,
          has_face_vector: Boolean(facePayload),
        };
      }),
    );

    return {
      total: enriched.length,
      users: enriched,
    };
  }

  async deleteRegisteredUser(userId: string): Promise<{ success: true; deleted_user_id: string }> {
    this.postgresService.assertReady();

    const user = await this.usersService.findById(userId);
    const allowlist = parseAdminEmailAllowlist(
      this.configService.get<string>('auth.adminEmails'),
    );

    if (isAdminEmail(user.email, allowlist)) {
      throw new ForbiddenException('Admin accounts cannot be deleted from this panel');
    }

    await this.deleteUserVectors(userId);
    await this.faceStorageService.deleteUserFaceFiles(userId);
    await this.deleteWardrobeUploads(userId);
    await this.usersService.deleteUserById(userId);

    this.logger.log(`Admin deleted user ${userId}`);

    return { success: true, deleted_user_id: userId };
  }

  private async loadFacePayloadMap(): Promise<Map<string, FaceVectorPayload>> {
    const map = new Map<string, FaceVectorPayload>();

    if (!this.qdrantService.isReady()) {
      return map;
    }

    const payloads = await this.qdrantService.listFaceVectorPayloads();
    for (const entry of payloads) {
      const userId = entry.payload?.user_id;
      if (userId) {
        map.set(userId, entry.payload);
      }
    }

    return map;
  }

  private async deleteUserVectors(userId: string): Promise<void> {
    if (!this.qdrantService.isReady()) {
      throw new ServiceUnavailableException(
        'Qdrant is not connected. Cannot delete face vectors safely.',
      );
    }

    await Promise.all([
      this.qdrantService.deleteFaceByUserId(userId),
      this.qdrantService.deleteFashionDnaByUserId(userId),
      this.qdrantService.deleteRecommendationsByUserId(userId),
      this.qdrantService.deleteClothingItemsByUserId(userId),
    ]);
  }

  private async deleteWardrobeUploads(userId: string): Promise<void> {
    const wardrobeDir = join(process.cwd(), 'uploads', 'wardrobe', userId);
    await rm(wardrobeDir, { recursive: true, force: true });
    this.logger.log(`Removed wardrobe uploads for user ${userId}`);
  }
}
