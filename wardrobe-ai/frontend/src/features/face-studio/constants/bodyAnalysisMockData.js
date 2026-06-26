/** Full Body Analysis Engine — mock biometric outputs */

export const BODY_ANALYSIS_DURATION_MS = 3000;

export const PRIMARY_BODY_TYPE = 'Athletic';

export const BODY_TYPE_OPTIONS = ['Slim', 'Athletic', 'Average', 'Muscular'];

export const BODY_MEASUREMENTS = [
  { label: 'Height', value: "5' 11\"" },
  { label: 'Shoulders', value: '46"' },
  { label: 'Chest', value: '42"' },
  { label: 'Waist', value: '32"' },
  { label: 'Hip', value: '38"' },
  { label: 'Arm Length', value: '26"' },
  { label: 'Leg Length', value: '34"' },
];

export const DEFAULT_BODY_PREVIEW_IMAGE =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80&auto=format&fit=crop';

export const BODY_INPUT_METHODS = {
  PHOTO: 'photo',
  VIDEO: 'video',
};
