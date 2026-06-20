export const POSTGRES_TABLES = {
  USERS: 'wardrobe.users',
  USER_PROFILES: 'wardrobe.user_profiles',
  USER_PREFERENCES: 'wardrobe.user_preferences',
  FASHION_DNA: 'wardrobe.fashion_dna',
  CLOTHING_ITEMS: 'wardrobe.clothing_items',
  OUTFITS: 'wardrobe.outfits',
  SCHEMA_MIGRATIONS: 'wardrobe.schema_migrations',
} as const;

export const POSTGRES_PHASE2_TABLES = [
  POSTGRES_TABLES.USER_PROFILES,
  POSTGRES_TABLES.USER_PREFERENCES,
  POSTGRES_TABLES.FASHION_DNA,
] as const;

export const POSTGRES_PHASE3_TABLES = [POSTGRES_TABLES.CLOTHING_ITEMS] as const;

export const POSTGRES_PHASE4_TABLES = [POSTGRES_TABLES.OUTFITS] as const;

export const QDRANT_COLLECTION_KEYS = {
  FACES: 'faces',
  FASHION_DNA: 'fashionDna',
  RECOMMENDATIONS: 'recommendations',
  CLOTHING_ITEMS: 'clothingItems',
} as const;

export const QDRANT_COLLECTION_DEFAULTS = {
  [QDRANT_COLLECTION_KEYS.FACES]: 'users_face_vectors',
  [QDRANT_COLLECTION_KEYS.FASHION_DNA]: 'fashion_dna_vectors',
  [QDRANT_COLLECTION_KEYS.RECOMMENDATIONS]: 'recommendation_vectors',
  [QDRANT_COLLECTION_KEYS.CLOTHING_ITEMS]: 'clothing_item_vectors',
} as const;

export type PostgresTableName = (typeof POSTGRES_TABLES)[keyof typeof POSTGRES_TABLES];

export interface FashionDnaVectorPayload {
  user_id: string;
  fashion_dna_id: string;
  fashion_style?: string;
  style_score?: number;
}

export interface RecommendationVectorPayload {
  user_id: string;
  item_id: string;
  category?: string;
  source?: string;
}

export interface ClothingItemVectorPayload {
  user_id: string;
  clothing_id: string;
  category: string;
  color_hex?: string;
}
