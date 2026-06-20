import { CLOTHING_SEASONS } from '../../wardrobe/constants/wardrobe.constants';

export { CLOTHING_SEASONS as OUTFIT_SEASONS };

export const OUTFIT_REQUIRED_CATEGORIES = ['Top', 'Bottom', 'Footwear'] as const;

export const OUTFIT_STYLE_SCORE_MIN = 70;
export const OUTFIT_STYLE_SCORE_MAX = 99;

export const OUTFIT_CATEGORY_MAP = {
  Top: 'tops',
  Bottom: 'bottoms',
  Footwear: 'footwear',
  Accessory: 'accessories',
} as const;
