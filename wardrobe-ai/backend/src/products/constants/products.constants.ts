export const PRODUCT_CATEGORIES = ['Men', 'Women', 'Footwear', 'Accessories'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_COLUMNS =
  'id, sku, brand, name, category, price, image_url, ai_render_image, style_tags, created_at, updated_at';

/** Catalog items with 3D .glb try-on assets (frontend/public/models/) */
export const GLB_CATALOG_PRODUCTS = [
  {
    sku: 'SKU-GLB-001',
    brand: 'Style Studio',
    name: 'Premium 3D Linen Shirt',
    category: 'Men' as const,
    price: 3499,
    glb_url: '/models/shirt.glb',
    has_sleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1602810318383-0e0111714b98?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'shirt', 'casual'],
  },
  {
    sku: 'SKU-GLB-002',
    brand: 'The North Face',
    name: '3D Urban Bomber Jacket',
    category: 'Men' as const,
    price: 5999,
    glb_url: '/models/north_face_jacket.glb',
    has_sleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1591047133409-47a58243f5b5?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'jacket', 'outerwear'],
  },
  {
    sku: 'SKU-GLB-003',
    brand: 'Style Studio',
    name: '3D Formal Blazer',
    category: 'Men' as const,
    price: 8999,
    glb_url: '/models/doctors_casual_attire_-_tf2_workshop.glb',
    has_sleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1591369822096-ffd037ecdf98?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1594938298598-708a05fce089?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'blazer', 'formal'],
  },
  {
    sku: 'SKU-GLB-004',
    brand: 'Style Studio',
    name: '3D Utility Field Jacket',
    category: 'Women' as const,
    price: 5499,
    glb_url: '/models/female_police_clothing_-_4k.glb',
    has_sleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1529139573956-d9ad40e4ffc4?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'jacket', 'utility'],
  },
] as const;

export const CATALOG_SEED_PRODUCTS = [
  ...GLB_CATALOG_PRODUCTS,
  {
    sku: 'SKU-MEN-001',
    brand: 'SSENSE',
    name: 'Tailored Charcoal Suit',
    category: 'Men',
    price: 12999,
    image_url:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1594938298598-708a05fce089?w=800&q=80',
    style_tags: ['formal', 'tailored', 'suit'],
  },
  {
    sku: 'SKU-MEN-002',
    brand: 'ZARA',
    name: 'Relaxed Linen Camp Shirt',
    category: 'Men',
    price: 3499,
    image_url:
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    style_tags: ['casual', 'linen', 'summer'],
  },
  {
    sku: 'SKU-MEN-003',
    brand: 'SSENSE',
    name: 'Premium Fleece Hoodie',
    category: 'Men',
    price: 4299,
    image_url:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1552374196-c536e16f65ca?w=800&q=80',
    style_tags: ['streetwear', 'hoodie', 'comfort'],
  },
  {
    sku: 'SKU-MEN-004',
    brand: 'ZARA',
    name: 'Structured Bomber Jacket',
    category: 'Men',
    price: 5999,
    image_url:
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1591047133409-47a58243f5b5?w=800&q=80',
    style_tags: ['outerwear', 'jacket', 'urban'],
  },
  {
    sku: 'SKU-WOMEN-001',
    brand: 'SSENSE',
    name: 'Editorial Power Set',
    category: 'Women',
    price: 8499,
    image_url:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    style_tags: ['editorial', 'statement', 'runway'],
  },
  {
    sku: 'SKU-WOMEN-002',
    brand: 'ZARA',
    name: 'Classic Floral Summer Dress',
    category: 'Women',
    price: 2199,
    image_url:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1595777453582-2d899e6d8b1e?w=800&q=80',
    style_tags: ['dress', 'elegant', 'summer'],
  },
  {
    sku: 'SKU-WOMEN-003',
    brand: 'SSENSE',
    name: 'Elevated Casual Ensemble',
    category: 'Women',
    price: 3899,
    image_url:
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    style_tags: ['casual', 'minimal', 'everyday'],
  },
  {
    sku: 'SKU-WOMEN-004',
    brand: 'ZARA',
    name: 'Slim Fit Denim Jeans',
    category: 'Women',
    price: 1899,
    image_url:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    style_tags: ['denim', 'bottoms', 'everyday'],
  },
  {
    sku: 'SKU-ACC-001',
    brand: 'SSENSE',
    name: 'Minimalist Chronograph',
    category: 'Accessories',
    price: 15999,
    image_url:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1434056888555-438048964106?w=800&q=80',
    style_tags: ['watch', 'luxury', 'timepiece'],
  },
  {
    sku: 'SKU-ACC-002',
    brand: 'ZARA',
    name: 'Structured Leather Tote',
    category: 'Accessories',
    price: 4999,
    image_url:
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1548036328-c9a89d128774?w=800&q=80',
    style_tags: ['handbag', 'leather', 'everyday'],
  },
  {
    sku: 'SKU-ACC-003',
    brand: 'SSENSE',
    name: 'Aviator Sunglasses',
    category: 'Accessories',
    price: 6499,
    image_url:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80',
    style_tags: ['eyewear', 'summer', 'statement'],
  },
  {
    sku: 'SKU-ACC-004',
    brand: 'ZARA',
    name: 'Gold Layered Necklace Set',
    category: 'Accessories',
    price: 2499,
    image_url:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
    style_tags: ['jewelry', 'gold', 'layered'],
  },
  {
    sku: 'SKU-FOOT-001',
    brand: 'SSENSE',
    name: 'Carmine Runner Sneaker',
    category: 'Footwear',
    price: 7999,
    image_url:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1606107557195-0ccc9b751f4e?w=800&q=80',
    style_tags: ['sneakers', 'sport', 'statement'],
  },
  {
    sku: 'SKU-FOOT-002',
    brand: 'ZARA',
    name: 'Cloud White Court Sneaker',
    category: 'Footwear',
    price: 3999,
    image_url:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    style_tags: ['sneakers', 'minimal', 'everyday'],
  },
  {
    sku: 'SKU-FOOT-003',
    brand: 'SSENSE',
    name: 'Sculpted Stiletto Heel',
    category: 'Footwear',
    price: 9499,
    image_url:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
    style_tags: ['heels', 'evening', 'elegant'],
  },
  {
    sku: 'SKU-FOOT-004',
    brand: 'ZARA',
    name: 'Chelsea Leather Boot',
    category: 'Footwear',
    price: 6299,
    image_url:
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
    ai_render_image:
      'https://images.unsplash.com/photo-1617604612902-7fe693737274?w=800&q=80',
    style_tags: ['boots', 'leather', 'autumn'],
  },
] as const;

export const PRODUCT_GLB_BY_SKU: Record<string, string> = {
  'SKU-GLB-001': '/models/shirt.glb',
  'SKU-GLB-002': '/models/north_face_jacket.glb',
  'SKU-GLB-003': '/models/doctors_casual_attire_-_tf2_workshop.glb',
  'SKU-GLB-004': '/models/female_police_clothing_-_4k.glb',
};

export const PRODUCT_HAS_SLEEVES_BY_SKU: Record<string, boolean> = Object.fromEntries(
  Object.keys(PRODUCT_GLB_BY_SKU).map((sku) => [sku, true]),
);

export const NON_3D_PRODUCT_CATEGORIES = new Set(['Accessories', 'Footwear']);
