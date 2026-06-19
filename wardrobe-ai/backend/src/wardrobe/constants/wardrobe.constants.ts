export const CLOTHING_CATEGORIES = ['Top', 'Bottom', 'Footwear', 'Accessory'] as const;

export const CLOTHING_SEASONS = ['Summer', 'Winter', 'Spring', 'Fall', 'All'] as const;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
