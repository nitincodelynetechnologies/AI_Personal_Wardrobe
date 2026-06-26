/** Face Analysis Engine mock AI confidence scores */

export const FACE_SHAPE_SCORES = [
  { shape: 'Oval', score: 72 },
  { shape: 'Round', score: 65 },
  { shape: 'Square', score: 58 },
  { shape: 'Diamond', score: 88 },
  { shape: 'Heart', score: 61 },
];

export const SKIN_TONE_SCORES = [
  { tone: 'Fair', score: 38 },
  { tone: 'Light', score: 54 },
  { tone: 'Medium', score: 71 },
  { tone: 'Wheatish', score: 92 },
  { tone: 'Deep', score: 29 },
];

export const HAIR_ANALYSIS = {
  length: { label: 'Medium', confidence: 87 },
  color: { label: 'Dark Brown', confidence: 94 },
  style: { label: 'Wavy', confidence: 81 },
};

export const BEARD_ANALYSIS = [
  { type: 'Clean Shave', score: 34 },
  { type: 'Light Beard', score: 88 },
  { type: 'Full Beard', score: 52 },
];

export const PRIMARY_FACE_SHAPE = 'Diamond';
export const PRIMARY_SKIN_TONE = 'Wheatish';
export const PRIMARY_BEARD_TYPE = 'Light Beard';

export const BIOMETRIC_ANALYSIS_DURATION_MS = 3000;
