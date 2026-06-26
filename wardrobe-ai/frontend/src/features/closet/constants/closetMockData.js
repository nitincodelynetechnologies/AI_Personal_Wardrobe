export const CLOSET_TABS = [
  { id: 'dna', label: 'Fashion DNA' },
  { id: 'looks', label: 'Saved Looks' },
];

export const MOCK_CLOSET_ITEMS = [
  {
    id: 'mock-1',
    name: 'Casual Linen Shirt',
    brand: 'ZARA',
    category: 'Tops',
    glbUrl: '/models/shirt.glb',
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
    source: 'purchased',
  },
  {
    id: 'mock-2',
    name: 'Urban Bomber Jacket',
    brand: 'NORTH FACE',
    category: 'Outerwear',
    glbUrl: '/models/north_face_jacket.glb',
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
    source: 'purchased',
  },
  {
    id: 'mock-3',
    name: 'Formal Blazer',
    brand: 'SSENSE',
    category: 'Outerwear',
    glbUrl: '/models/doctors_casual_attire_-_tf2_workshop.glb',
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    source: 'uploaded',
  },
  {
    id: 'mock-4',
    name: 'Structured Utility Jacket',
    brand: 'EDITORIAL',
    category: 'Outerwear',
    glbUrl: '/models/female_police_clothing_-_4k.glb',
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80',
    source: 'purchased',
  },
];

export const MOCK_SAVED_LOOKS = [
  {
    id: 'look-mock-1',
    name: 'Boardroom Edge',
    season_tag: 'All Season',
    style_score: 92,
    top: {
      image_url:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400',
      sub_category: 'Blazer',
    },
    bottom: {
      image_url:
        'https://images.unsplash.com/photo-1624378515194-6db329ce7b72?auto=format&fit=crop&q=80&w=400',
      sub_category: 'Trousers',
    },
    footwear: {
      image_url:
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400',
      sub_category: 'Sneakers',
    },
  },
  {
    id: 'look-mock-2',
    name: 'Evening Silk',
    season_tag: 'Spring',
    style_score: 88,
    top: {
      image_url:
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=400',
      sub_category: 'Dress',
    },
    bottom: {
      image_url:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
      sub_category: 'Trousers',
    },
    footwear: {
      image_url:
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=400',
      sub_category: 'Boots',
    },
  },
];

export const MOCK_FASHION_DNA = {
  style_score: 85,
  lifestyle_score: 78,
  color_affinity: {
    navy: 0.92,
    black: 0.88,
    olive: 0.75,
    white: 0.68,
  },
  brand_affinity: {
    COS: 0.82,
    ZARA: 0.76,
  },
  fashion_style: 'business_casual',
};

export const MOCK_BODY_TRAITS = {
  bodyType: 'Athletic',
  skinTone: 'Medium',
  faceShape: 'Oval',
};

export const MOCK_STYLE_TAGS = ['Business Casual', 'Minimalist', 'Monochrome', 'Tailored'];

export const CLOSET_COLOR_SWATCHES = [
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'White', hex: '#f5f5f5' },
];

export function mapWardrobeItemToClosetCard(item) {
  return {
    id: item.id,
    name: item.sub_category || item.category || 'Clothing Item',
    brand: item.category || 'My Closet',
    category: item.category,
    image_url: item.image_url,
    glbUrl: item.glb_url || item.glbUrl || null,
    hasSleeves: item.has_sleeves ?? item.hasSleeves ?? null,
    source: 'uploaded',
  };
}
