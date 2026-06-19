export interface ClothingItemRecord {
  id: string;
  user_id: string;
  image_url: string;
  category: string;
  sub_category: string | null;
  color_hex: string | null;
  season: string;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UploadClothingInput {
  category: string;
  sub_category?: string;
  color_hex?: string;
  season?: string;
}
