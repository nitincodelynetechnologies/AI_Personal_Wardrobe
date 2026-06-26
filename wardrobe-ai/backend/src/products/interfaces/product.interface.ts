import { ProductCategory } from '../constants/products.constants';

export interface ProductRecord {
  id: string;
  sku: string;
  brand: string;
  name: string;
  category: ProductCategory;
  price: string | number;
  image_url: string;
  ai_render_image: string;
  glb_url?: string;
  has_sleeves?: boolean;
  style_tags: string[];
  created_at: string;
  updated_at: string;
}
