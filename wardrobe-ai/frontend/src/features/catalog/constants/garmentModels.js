/** Virtual try-on avatar (frontend/public/dummy.glb) */
export const AVATAR_BASE_PATHS = {
  FULL_BODY: '/dummy.glb',
  /** @deprecated Always use FULL_BODY — dummy1 is not bundled */
  ARMLESS: '/dummy.glb',
};

/** Canonical garment GLB paths (frontend/public/models/) */
export const GARMENT_GLB_PATHS = {
  SHIRT: '/models/shirt.glb',
  JACKET: '/models/north_face_jacket.glb',
  BLAZER: '/models/doctors_casual_attire_-_tf2_workshop.glb',
  UTILITY_JACKET: '/models/female_police_clothing_-_4k.glb',
};

/** 3D garment assets served from frontend/public/models/ */
export const GARMENT_GLB_MODELS = [
  {
    id: 'premium-3d-linen-shirt',
    name: 'Premium 3D Linen Shirt',
    category: 'Top',
    glbUrl: GARMENT_GLB_PATHS.SHIRT,
    hasSleeves: true,
    imageUrl:
      'https://images.unsplash.com/photo-1602810318383-0e0111714b98?w=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'urban-bomber-jacket-3d',
    name: '3D Urban Bomber Jacket',
    category: 'Top',
    glbUrl: GARMENT_GLB_PATHS.JACKET,
    hasSleeves: true,
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'formal-blazer-3d',
    name: '3D Formal Blazer',
    category: 'Top',
    glbUrl: GARMENT_GLB_PATHS.BLAZER,
    hasSleeves: true,
    imageUrl:
      'https://images.unsplash.com/photo-1591369822096-ffd037ecdf98?w=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'utility-field-jacket-3d',
    name: '3D Utility Field Jacket',
    category: 'Top',
    glbUrl: GARMENT_GLB_PATHS.UTILITY_JACKET,
    hasSleeves: true,
    imageUrl:
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85&auto=format&fit=crop',
  },
];

/** Only dedicated 3D catalog SKUs — never infer GLB for standard 2D products */
export const PRODUCT_GLB_BY_SKU = {
  'SKU-GLB-001': GARMENT_GLB_PATHS.SHIRT,
  'SKU-GLB-002': GARMENT_GLB_PATHS.JACKET,
  'SKU-GLB-003': GARMENT_GLB_PATHS.BLAZER,
  'SKU-GLB-004': GARMENT_GLB_PATHS.UTILITY_JACKET,
};

/** Long-sleeve / jacket meshes need the armless avatar base (dummy1.glb) */
export const GARMENT_HAS_SLEEVES_BY_URL = {
  [GARMENT_GLB_PATHS.SHIRT]: true,
  [GARMENT_GLB_PATHS.JACKET]: true,
  [GARMENT_GLB_PATHS.BLAZER]: true,
  [GARMENT_GLB_PATHS.UTILITY_JACKET]: true,
};

export const PRODUCT_HAS_SLEEVES_BY_SKU = Object.fromEntries(
  Object.keys(PRODUCT_GLB_BY_SKU).map((sku) => [sku, true]),
);

export const NON_3D_CATALOG_CATEGORIES = new Set(['Accessories', 'Footwear']);

export const DEFAULT_GARMENT_GLB_URL = GARMENT_GLB_PATHS.SHIRT;

export const GARMENT_GLB_URLS = [...new Set(GARMENT_GLB_MODELS.map((garment) => garment.glbUrl))];

function inferGlbUrlFromProduct(product) {
  const name = (product.name || '').toLowerCase();
  const tags = Array.isArray(product.style_tags) ? product.style_tags.join(' ').toLowerCase() : '';
  const category = product.category || '';
  const haystack = `${name} ${tags}`;

  if (category === 'Women') {
    if (/utility|streetwear|field jacket|police/i.test(haystack)) {
      return GARMENT_GLB_PATHS.UTILITY_JACKET;
    }
    if (/blazer|suit|formal|tailored|dress|coat|editorial|power/i.test(haystack)) {
      return GARMENT_GLB_PATHS.BLAZER;
    }
    if (/jacket|bomber|outerwear|parka/i.test(haystack)) {
      return GARMENT_GLB_PATHS.JACKET;
    }
    return GARMENT_GLB_PATHS.SHIRT;
  }

  if (/suit|blazer|formal|tailored|charcoal|wool coat|oversized wool/i.test(haystack)) {
    return GARMENT_GLB_PATHS.BLAZER;
  }
  if (/jacket|bomber|outerwear|parka|hoodie|fleece/i.test(haystack)) {
    return GARMENT_GLB_PATHS.JACKET;
  }
  if (/shirt|linen|denim|sweater|top|camp|cashmere|knit/i.test(haystack)) {
    return GARMENT_GLB_PATHS.SHIRT;
  }

  if (category === 'Men' || category === 'Women') {
    return DEFAULT_GARMENT_GLB_URL;
  }

  return null;
}

/**
 * Strict card / grid GLB resolver — ONLY the glbUrl on the product record.
 * No SKU maps, no name/id inference, no default garment mesh.
 */
export function getExplicitProductGlbUrl(product) {
  if (!product) return null;
  if (NON_3D_CATALOG_CATEGORIES.has(product.category)) return null;

  const glbUrl = product.glbUrl ?? product.glb_url;
  if (typeof glbUrl !== 'string') return null;

  const trimmed = glbUrl.trim();
  return trimmed || null;
}

/** Virtual try-on — explicit GLB first, then infer for Men/Women apparel only */
export function getProductGlbUrl(product) {
  if (!product) return null;

  const explicit = getExplicitProductGlbUrl(product);
  if (explicit) return explicit;

  if (NON_3D_CATALOG_CATEGORIES.has(product.category)) return null;

  if (product.category === 'Men' || product.category === 'Women') {
    return inferGlbUrlFromProduct(product);
  }

  return null;
}

export const resolveTryOnGlbUrl = getProductGlbUrl;

/**
 * Try-on modal / avatar — ONLY the glbUrl on the product record.
 * No inference, no SKU fallback, no default garment mesh.
 */
export function getTryOnGarmentGlbUrl(product) {
  if (!product) return null;
  if (NON_3D_CATALOG_CATEGORIES.has(product.category)) return null;

  const glbUrl = product.glbUrl ?? product.glb_url;
  if (typeof glbUrl !== 'string') return null;

  const trimmed = glbUrl.trim();
  return trimmed || null;
}

function inferHasSleevesFromProduct(product, glbUrl) {
  if (glbUrl && GARMENT_HAS_SLEEVES_BY_URL[glbUrl]) {
    return true;
  }

  const name = (product?.name || '').toLowerCase();
  const tags = Array.isArray(product?.style_tags) ? product.style_tags.join(' ').toLowerCase() : '';
  const haystack = `${name} ${tags}`;

  if (/sleeveless|tank|vest|camisole|strapless/i.test(haystack)) {
    return false;
  }

  if (/jacket|blazer|coat|hoodie|sweater|shirt|dress|suit|outerwear|knit|fleece|parka|bomber/i.test(haystack)) {
    return true;
  }

  return Boolean(glbUrl && GARMENT_HAS_SLEEVES_BY_URL[glbUrl]);
}

/** Whether try-on should swap to the armless base mesh (dummy1.glb) */
export function resolveHasSleeves(product, glbUrl = null) {
  if (!product && !glbUrl) return false;

  if (product?.has_sleeves != null) return Boolean(product.has_sleeves);
  if (product?.hasSleeves != null) return Boolean(product.hasSleeves);

  const resolvedGlb = glbUrl || getProductGlbUrl(product);
  if (resolvedGlb && GARMENT_HAS_SLEEVES_BY_URL[resolvedGlb] != null) {
    return GARMENT_HAS_SLEEVES_BY_URL[resolvedGlb];
  }

  if (product?.sku && PRODUCT_HAS_SLEEVES_BY_SKU[product.sku] != null) {
    return PRODUCT_HAS_SLEEVES_BY_SKU[product.sku];
  }

  if (product?.id && GARMENT_GLB_MODELS.find((entry) => entry.id === product.id)?.hasSleeves != null) {
    return Boolean(GARMENT_GLB_MODELS.find((entry) => entry.id === product.id)?.hasSleeves);
  }

  return inferHasSleevesFromProduct(product, resolvedGlb);
}

/** Virtual try-on always uses the full-body dummy mesh */
export function getAvatarBasePath(_hasSleeves = false) {
  return AVATAR_BASE_PATHS.FULL_BODY;
}

export function enrichProductWithGlb(product) {
  if (!product) return product;

  let glbUrl = getExplicitProductGlbUrl(product);

  // Strip legacy GLB paths mistakenly attached to standard 2D SKUs in older seeds/DB rows
  if (glbUrl && product.sku && !PRODUCT_GLB_BY_SKU[product.sku]) {
    glbUrl = null;
  }

  if (!glbUrl) {
    const { glb_url: _a, glbUrl: _b, has_sleeves: _c, hasSleeves: _d, ...rest } = product;
    return rest;
  }

  const hasSleeves = resolveHasSleeves(product, glbUrl);

  return {
    ...product,
    glb_url: glbUrl,
    glbUrl,
    has_sleeves: hasSleeves,
    hasSleeves,
  };
}

export function has3dTryOn(product) {
  return Boolean(getExplicitProductGlbUrl(product));
}

/** Per-GLB fit tuning — offsets are in mannequin local space after prepareModel */
export const DEFAULT_GARMENT_FIT = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  offsetZ: -0.03,
  heightRatio: 0.42,
  widthRatio: 1.02,
  torsoWidthFactor: 1,
  hideSleeveSpan: false,
};

export const GARMENT_FIT_BY_URL = {
  [GARMENT_GLB_PATHS.SHIRT]: {
    scale: 0.96,
    offsetY: 0.06,
    offsetZ: -0.035,
    heightRatio: 0.38,
    widthRatio: 1.05,
    hideSleeveSpan: false,
  },
  [GARMENT_GLB_PATHS.JACKET]: {
    scale: 1.04,
    offsetY: 0.06,
    offsetZ: -0.038,
    heightRatio: 0.48,
    widthRatio: 1.06,
    torsoWidthFactor: 0.38,
  },
  [GARMENT_GLB_PATHS.BLAZER]: {
    scale: 1,
    offsetY: 0.05,
    offsetZ: -0.03,
    heightRatio: 0.44,
    widthRatio: 1.0,
    torsoWidthFactor: 0.11,
  },
  [GARMENT_GLB_PATHS.UTILITY_JACKET]: {
    scale: 1,
    offsetY: 0.07,
    offsetZ: -0.04,
    heightRatio: 0.42,
    widthRatio: 1.0,
    torsoWidthFactor: 0.09,
  },
};

export function getGarmentFit(glbUrl) {
  return { ...DEFAULT_GARMENT_FIT, ...(GARMENT_FIT_BY_URL[glbUrl] || {}) };
}
