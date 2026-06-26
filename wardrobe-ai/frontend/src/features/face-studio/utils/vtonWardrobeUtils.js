import { CATALOG_IMAGE_FALLBACK } from '@/features/catalog/constants/catalogOptions';
import { GARMENT_OVERLAY_OFFSET } from '@/features/face-studio/constants/bodyVtonMockData';

const VTON_CATEGORY_MAP = {
  Top: 'top',
  Bottom: 'bottom',
  Footwear: 'shoes',
};

const TRY_ON_CATEGORIES = new Set(['Top', 'Bottom', 'Footwear']);

export function resolveWardrobeImageUrl(imageUrl) {
  if (!imageUrl?.trim()) return CATALOG_IMAGE_FALLBACK;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

export function mapWardrobeItemToVtonGarment(item) {
  if (!item?.id || !TRY_ON_CATEGORIES.has(item.category)) {
    return null;
  }

  const type = VTON_CATEGORY_MAP[item.category];
  if (!type) return null;

  return {
    id: item.id,
    wardrobeItemId: item.id,
    type,
    name: item.sub_category || item.category,
    img: resolveWardrobeImageUrl(item.image_url),
    category: item.category,
    color_hex: item.color_hex ?? null,
  };
}

export function mapWardrobeItemsToVtonGarments(items = []) {
  return items
    .map(mapWardrobeItemToVtonGarment)
    .filter(Boolean);
}

export function getGarmentOverlayOffset(garment) {
  if (!garment?.type) return 0;
  return GARMENT_OVERLAY_OFFSET[garment.type] ?? 0;
}
