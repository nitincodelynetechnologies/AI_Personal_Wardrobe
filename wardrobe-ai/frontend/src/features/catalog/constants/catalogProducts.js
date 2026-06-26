import { GARMENT_GLB_PATHS } from '@/features/catalog/constants/garmentModels';

/**
 * Canonical catalog — explicit 3D vs 2D separation.
 * Only items with `glbUrl` render Mini3DViewer; all others are flat images only.
 * Each 3D product maps to a unique .glb path (no shared meshes across cards).
 */
export const FINAL_CATALOG_PRODUCTS = [
  {
    id: '3d-linen-shirt',
    sku: 'SKU-GLB-001',
    brand: 'Style Studio',
    name: 'Premium 3D Linen Shirt',
    category: 'Men',
    price: 3499,
    glbUrl: GARMENT_GLB_PATHS.SHIRT,
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1602810318383-0e0111714b98?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'shirt', 'casual'],
  },
  {
    id: '3d-bomber-jacket',
    sku: 'SKU-GLB-002',
    brand: 'The North Face',
    name: '3D Urban Bomber Jacket',
    category: 'Men',
    price: 5999,
    glbUrl: GARMENT_GLB_PATHS.JACKET,
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1591047133409-47a58243f5b5?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'jacket', 'outerwear'],
  },
  {
    id: '3d-formal-blazer',
    sku: 'SKU-GLB-003',
    brand: 'Style Studio',
    name: '3D Formal Blazer',
    category: 'Men',
    price: 8999,
    glbUrl: GARMENT_GLB_PATHS.BLAZER,
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1591369822096-ffd037ecdf98?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1594938298598-708a05fce089?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'blazer', 'formal'],
  },
  {
    id: '3d-utility-jacket',
    sku: 'SKU-GLB-004',
    brand: 'Style Studio',
    name: '3D Utility Field Jacket',
    category: 'Women',
    price: 5499,
    glbUrl: GARMENT_GLB_PATHS.UTILITY_JACKET,
    hasSleeves: true,
    image_url:
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85&auto=format&fit=crop',
    ai_render_image:
      'https://images.unsplash.com/photo-1529139573956-d9ad40e4ffc4?w=900&q=85&auto=format&fit=crop',
    style_tags: ['3d-try-on', 'jacket', 'utility'],
  },
  {
    id: '2d-charcoal-suit',
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
    id: '2d-linen-camp-shirt',
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
    id: '2d-fleece-hoodie',
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
    id: '2d-bomber-jacket-flat',
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
    id: '2d-power-set',
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
    id: '2d-summer-dress',
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
    id: '2d-casual-ensemble',
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
    id: '2d-denim-jeans',
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
    id: '2d-chronograph',
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
    id: '2d-leather-tote',
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
    id: '2d-aviator-sunglasses',
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
    id: '2d-gold-necklace',
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
    id: '2d-runner-sneaker',
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
    id: '2d-court-sneaker',
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
    id: '2d-stiletto',
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
    id: '2d-chelsea-boot',
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
];

/** Normalize seed records for API-shaped responses */
export function normalizeCatalogProduct(product) {
  const glbUrl = product.glbUrl?.trim() || undefined;
  const base = {
    ...product,
    glb_url: glbUrl,
    glbUrl,
  };

  if (!glbUrl) {
    const { glb_url: _a, glbUrl: _b, has_sleeves: _c, hasSleeves: _d, ...rest } = base;
    return rest;
  }

  return {
    ...base,
    has_sleeves: product.hasSleeves ?? product.has_sleeves ?? true,
    hasSleeves: product.hasSleeves ?? product.has_sleeves ?? true,
  };
}

/**
 * Immutable system catalog — original 3D + 2D garments.
 * Always merged with admin items from vton_global_catalog; never overwritten.
 */
export const DEFAULT_GARMENTS = FINAL_CATALOG_PRODUCTS.map(normalizeCatalogProduct);

export function getCatalogFallbackProducts(category = 'All') {
  if (!category || category === 'All') return [...DEFAULT_GARMENTS];
  return DEFAULT_GARMENTS.filter((product) => product.category === category);
}
