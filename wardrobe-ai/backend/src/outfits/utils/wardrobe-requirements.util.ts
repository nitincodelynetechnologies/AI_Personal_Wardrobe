import { ClothingItemRecord } from '../../wardrobe/interfaces/clothing-item.interface';

const REQUIRED_CATEGORIES = ['Top', 'Bottom', 'Footwear'] as const;

export function hasRequiredWardrobeCategories(items: ClothingItemRecord[]): boolean {
  const categories = new Set(items.map((item) => item.category));
  return REQUIRED_CATEGORIES.every((category) => categories.has(category));
}
