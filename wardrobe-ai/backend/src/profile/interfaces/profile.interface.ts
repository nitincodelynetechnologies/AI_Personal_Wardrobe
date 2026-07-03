export interface UserProfileRecord {
  id: string;
  user_id: string;
  gender: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  body_type: string | null;
  skin_tone: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferencesRecord {
  id: string;
  user_id: string;
  favorite_colors: string[];
  favorite_brands: string[];
  budget_range: string | null;
  fashion_style: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CombinedProfileResponse {
  name: string | null;
  profile: UserProfileRecord | null;
  preferences: UserPreferencesRecord | null;
}

export interface UpdatePreferencesInput {
  favorite_colors?: string[];
  favorite_brands?: string[];
  budget_range?: string;
  fashion_style?: string;
}

export interface UpdateProfileInput {
  name?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  body_type?: string;
  skin_tone?: string;
}
