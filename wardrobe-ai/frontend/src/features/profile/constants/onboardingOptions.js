export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const BODY_TYPE_OPTIONS = [
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'curvy', label: 'Curvy' },
  { value: 'plus', label: 'Plus' },
];

export const SKIN_TONE_OPTIONS = [
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'deep', label: 'Deep' },
];

export const FASHION_STYLE_OPTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'classic', label: 'Classic' },
];

export const BRAND_OPTIONS = [
  'Zara',
  'H&M',
  'Uniqlo',
  'Nike',
  'Adidas',
  'Gucci',
  'Prada',
  'Levi\'s',
  'Gap',
  'Mango',
  'COS',
  'Burberry',
];

export const COLOR_SWATCHES = [
  { value: 'black', label: 'Black', hex: '#1a1a1a' },
  { value: 'white', label: 'White', hex: '#f5f5f5' },
  { value: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { value: 'beige', label: 'Beige', hex: '#d4c4a8' },
  { value: 'burgundy', label: 'Burgundy', hex: '#722f37' },
  { value: 'olive', label: 'Olive', hex: '#556b2f' },
  { value: 'blush', label: 'Blush', hex: '#e8b4b8' },
  { value: 'camel', label: 'Camel', hex: '#c19a6b' },
  { value: 'grey', label: 'Grey', hex: '#808080' },
  { value: 'emerald', label: 'Emerald', hex: '#046307' },
];

export const BUDGET_LEVELS = [
  { value: 'budget', label: 'Budget', min: 0 },
  { value: 'low', label: 'Affordable', min: 25 },
  { value: 'mid', label: 'Mid-range', min: 50 },
  { value: 'high', label: 'Premium', min: 75 },
  { value: 'luxury', label: 'Luxury', min: 90 },
];

export const ONBOARDING_STEPS = [
  { id: 1, label: 'Demographics', description: 'Tell us about you' },
  { id: 2, label: 'Style', description: 'Your fashion preferences' },
];

export function budgetSliderToRange(value) {
  const level = [...BUDGET_LEVELS].reverse().find((item) => value >= item.min);
  return level?.value ?? 'mid';
}

export function cmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet, inches) {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLbs(kg) {
  return Math.round(kg * 2.20462);
}

export function lbsToKg(lbs) {
  return Math.round(lbs / 2.20462);
}
