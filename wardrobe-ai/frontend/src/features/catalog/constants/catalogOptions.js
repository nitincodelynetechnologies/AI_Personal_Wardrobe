export const CATALOG_CATEGORIES = [
  { value: 'All', label: 'All' },
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Footwear', label: 'Footwear' },
  { value: 'Accessories', label: 'Accessories' },
];

export const CATALOG_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

export const CATALOG_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85&auto=format&fit=crop';

/** Unique display images per SKU when the primary URL fails to load */
export const CATALOG_IMAGE_FALLBACK_BY_SKU = {
  'SKU-GLB-001':
    'https://images.unsplash.com/photo-1602810318383-0e0111714b98?w=900&q=85&auto=format&fit=crop',
  'SKU-GLB-002':
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85&auto=format&fit=crop',
  'SKU-GLB-003':
    'https://images.unsplash.com/photo-1591369822096-ffd037ecdf98?w=900&q=85&auto=format&fit=crop',
  'SKU-GLB-004':
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85&auto=format&fit=crop',
  'SKU-MEN-001':
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&q=85&auto=format&fit=crop',
  'SKU-MEN-002':
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85&auto=format&fit=crop',
  'SKU-MEN-003':
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=85&auto=format&fit=crop',
  'SKU-MEN-004':
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=900&q=85&auto=format&fit=crop',
  'SKU-WOMEN-001':
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85&auto=format&fit=crop',
  'SKU-WOMEN-002':
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=85&auto=format&fit=crop',
  'SKU-WOMEN-003':
    'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=900&q=85&auto=format&fit=crop',
  'SKU-WOMEN-004':
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=85&auto=format&fit=crop',
  'SKU-ACC-001':
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85&auto=format&fit=crop',
  'SKU-ACC-002':
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=900&q=85&auto=format&fit=crop',
  'SKU-ACC-003':
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=85&auto=format&fit=crop',
  'SKU-ACC-004':
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=85&auto=format&fit=crop',
  'SKU-FOOT-001':
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85&auto=format&fit=crop',
  'SKU-FOOT-002':
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&q=85&auto=format&fit=crop',
  'SKU-FOOT-003':
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85&auto=format&fit=crop',
  'SKU-FOOT-004':
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&q=85&auto=format&fit=crop',
};

export function getProductImageFallback(product) {
  const sku = product?.sku;
  if (sku && CATALOG_IMAGE_FALLBACK_BY_SKU[sku]) {
    return CATALOG_IMAGE_FALLBACK_BY_SKU[sku];
  }
  return CATALOG_IMAGE_FALLBACK;
}

export function resolveProductImageUrl(product) {
  const direct = product?.imageUrl?.trim() || product?.image_url?.trim();
  if (direct) return direct;

  const render = product?.ai_render_image?.trim();
  if (render) return render;

  return getProductImageFallback(product);
}

export function formatCatalogPrice(price) {
  const amount = Number(price);
  if (Number.isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}
