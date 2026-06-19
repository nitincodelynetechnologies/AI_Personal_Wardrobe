export interface FashionDnaRecord {
  id: string;
  user_id: string;
  style_score: string | null;
  color_affinity: Record<string, number>;
  brand_affinity: Record<string, number>;
  lifestyle_score: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MockFashionDnaResult {
  style_score: number;
  lifestyle_score: number;
  color_affinity: Record<string, number>;
  brand_affinity: Record<string, number>;
}
