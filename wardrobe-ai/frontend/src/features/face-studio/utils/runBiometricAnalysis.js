import { extractSkinTone, SKIN_TONE_CATEGORIES } from '@/features/face-studio/utils/extractSkinTone';
import { analyzeFaceShape } from '@/features/face-studio/utils/analyzeFaceShape';

/**
 * @typedef {Object} BiometricAnalysisResult
 * @property {string} skinTone
 * @property {{ r: number, g: number, b: number }} skinToneRgb
 * @property {number} skinToneLuminance
 * @property {Array<{ tone: string, score: number }>} skinToneScores
 * @property {string} faceShape
 * @property {number} faceShapeConfidence
 * @property {'landmarks' | 'heuristic'} faceShapeMethod
 * @property {Array<{ shape: string, score: number }>} faceShapeScores
 * @property {string} hairProfile
 * @property {string} beardMatch
 * @property {{ length: { label: string, confidence: number }, color: { label: string, confidence: number }, style: { label: string, confidence: number } }} hairAnalysis
 * @property {Array<{ type: string, score: number }>} beardScores
 */

/**
 * @param {string} primaryTone
 * @returns {Array<{ tone: string, score: number }>}
 */
export function buildSkinToneScores(primaryTone) {
  const primaryIndex = SKIN_TONE_CATEGORIES.indexOf(primaryTone);

  return SKIN_TONE_CATEGORIES.map((tone, index) => {
    const distance = Math.abs(index - (primaryIndex === -1 ? 2 : primaryIndex));
    return {
      tone,
      score: Math.max(14, 94 - distance * 21),
    };
  });
}

/**
 * @param {string} primaryShape
 * @param {number} confidence
 * @returns {Array<{ shape: string, score: number }>}
 */
export function buildFaceShapeScores(primaryShape, confidence = 80) {
  const radarShapes = ['Oval', 'Round', 'Square', 'Diamond', 'Heart'];
  const primaryIndex = radarShapes.indexOf(primaryShape);

  return radarShapes.map((shape, index) => {
    const distance = Math.abs(index - (primaryIndex === -1 ? 0 : primaryIndex));
    const base = Math.max(18, confidence - distance * 16);
    return { shape, score: Math.min(99, base) };
  });
}

/**
 * @param {string} label
 * @returns {Array<{ type: string, score: number }>}
 */
export function buildBeardScores(label = 'Scanned') {
  const types = ['Clean Shave', 'Light Beard', 'Full Beard', 'Scanned'];
  return types.map((type) => ({
    type,
    score: type === label ? 88 : Math.max(20, 72 - Math.abs(types.indexOf(type) - types.indexOf(label)) * 18),
  }));
}

/**
 * @param {string} imageUrl
 * @param {HTMLCanvasElement | null} [analysisCanvas]
 * @returns {Promise<BiometricAnalysisResult>}
 */
export async function runBiometricAnalysis(imageUrl, analysisCanvas = null) {
  const [skinToneResult, faceShapeResult] = await Promise.all([
    extractSkinTone(imageUrl, analysisCanvas),
    analyzeFaceShape(imageUrl),
  ]);

  const hairProfile = 'Scanned';
  const beardMatch = 'Scanned';

  return {
    skinTone: skinToneResult.tone,
    skinToneRgb: skinToneResult.rgb,
    skinToneLuminance: skinToneResult.luminance,
    skinToneScores: buildSkinToneScores(skinToneResult.tone),
    faceShape: faceShapeResult.shape,
    faceShapeConfidence: faceShapeResult.confidence,
    faceShapeMethod: faceShapeResult.method,
    faceShapeScores: buildFaceShapeScores(faceShapeResult.shape, faceShapeResult.confidence),
    hairProfile,
    beardMatch,
    hairAnalysis: {
      length: { label: hairProfile, confidence: 72 },
      color: { label: hairProfile, confidence: 68 },
      style: { label: hairProfile, confidence: 70 },
    },
    beardScores: buildBeardScores(beardMatch),
  };
}
