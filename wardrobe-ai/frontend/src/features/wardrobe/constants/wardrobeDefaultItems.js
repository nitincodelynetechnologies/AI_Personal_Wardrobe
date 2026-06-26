import { GARMENT_GLB_MODELS } from '@/features/catalog/constants/garmentModels';

/** Seed wardrobe when API returns no uploaded items */
export const DEFAULT_WARDROBE_ITEMS = [
  {
    id: '3d-jacket-01',
    sub_category: 'Premium 3D Jacket',
    category: 'Top',
    season: 'All',
    color_hex: '#8b6f5c',
    image_url:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop',
    glb_url: '/models/shirt.glb',
    has_sleeves: true,
    hasSleeves: true,
    is_favorite: false,
  },
  {
    id: '3d-jacket-02',
    sub_category: 'Urban Bomber Jacket',
    category: 'Top',
    season: 'Winter',
    color_hex: '#2c3e50',
    image_url:
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
    glb_url: '/models/north_face_jacket.glb',
    has_sleeves: true,
    hasSleeves: true,
    is_favorite: false,
  },
  {
    id: '3d-jacket-03',
    sub_category: 'Formal Blazer',
    category: 'Top',
    season: 'All',
    color_hex: '#1e3a5f',
    image_url:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    glb_url: '/models/doctors_casual_attire_-_tf2_workshop.glb',
    has_sleeves: true,
    hasSleeves: true,
    is_favorite: false,
  },
  {
    id: '3d-jacket-04',
    sub_category: 'Structured Utility Jacket',
    category: 'Top',
    season: 'Fall',
    color_hex: '#4a5568',
    image_url: GARMENT_GLB_MODELS[3]?.imageUrl,
    glb_url: '/models/female_police_clothing_-_4k.glb',
    has_sleeves: true,
    hasSleeves: true,
    is_favorite: false,
  },
];
