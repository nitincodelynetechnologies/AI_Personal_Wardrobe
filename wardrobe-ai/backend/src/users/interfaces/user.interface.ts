export type UserStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'deleted';

export interface UserRecord {
  id: string;
  email: string | null;
  mobile: string | null;
  password_hash?: string;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: string;
  email: string | null;
  mobile: string | null;
  status: UserStatus;
  created_at: Date;
  role?: string;
}

export interface CreateUserInput {
  email?: string;
  mobile?: string;
  password: string;
  status?: UserStatus;
}

export interface FaceVectorPayload {
  user_id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}
