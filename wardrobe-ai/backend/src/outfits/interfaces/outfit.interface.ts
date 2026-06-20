import { ClothingItemRecord } from '../../wardrobe/interfaces/clothing-item.interface';

export interface OutfitRecord {
  id: string;
  user_id: string;
  name: string | null;
  top_id: string | null;
  bottom_id: string | null;
  footwear_id: string | null;
  accessory_id: string | null;
  style_score: number;
  season_tag: string;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PopulatedOutfit extends OutfitRecord {
  top: ClothingItemRecord | null;
  bottom: ClothingItemRecord | null;
  footwear: ClothingItemRecord | null;
  accessory: ClothingItemRecord | null;
}

export interface OutfitGenerationSelection {
  top_id: string;
  bottom_id: string;
  footwear_id: string;
  accessory_id: string | null;
  style_score: number;
  season_tag: string;
}
