import { loadFaceDetectionModels } from '@/features/auth/lib/faceDetectionEngine';
import { loadImageElement } from '@/features/face-studio/utils/imageCanvasUtils';
import { HEURISTIC_PLACEHOLDER_DELAY_MS } from '@/features/face-studio/utils/extractSkinTone';

export const FACE_SHAPE_CATEGORIES = ['Oval', 'Round', 'Square', 'Diamond', 'Heart', 'Oblong'];

let landmarkModelsPromise = null;

async function loadLandmarkModels() {
  if (!landmarkModelsPromise) {
    landmarkModelsPromise = (async () => {
      await loadFaceDetectionModels();
      const faceapi = await import('@vladmandic/face-api');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
      return faceapi;
    })();
  }

  return landmarkModelsPromise;
}

function distance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

/**
 * @param {import('@vladmandic/face-api').FaceLandmarks68} landmarks
 */
function classifyFaceShapeFromLandmarks(landmarks) {
  const points = landmarks.positions;

  const faceWidth = distance(points[0], points[16]);
  const faceHeight = distance(points[27], points[8]);
  const jawWidth = distance(points[4], points[12]);
  const cheekWidth = distance(points[2], points[14]);

  const widthHeightRatio = faceWidth / Math.max(faceHeight, 1);
  const jawFaceRatio = jawWidth / Math.max(faceWidth, 1);
  const cheekJawRatio = cheekWidth / Math.max(jawWidth, 1);

  if (widthHeightRatio > 0.92 && jawFaceRatio > 0.86) return 'Round';
  if (widthHeightRatio > 0.88 && jawFaceRatio > 0.9) return 'Square';
  if (widthHeightRatio < 0.72) return 'Oblong';
  if (jawFaceRatio < 0.76 && cheekJawRatio > 1.05) return 'Diamond';
  if (jawFaceRatio < 0.78 && widthHeightRatio > 0.78) return 'Heart';
  return 'Oval';
}

/**
 * @param {number} aspectRatio width / height
 */
function classifyFaceShapeFromAspectRatio(aspectRatio) {
  if (aspectRatio > 0.95) return 'Round';
  if (aspectRatio > 0.88) return 'Square';
  if (aspectRatio < 0.68) return 'Oblong';
  if (aspectRatio < 0.76) return 'Diamond';
  if (aspectRatio < 0.82) return 'Heart';
  return 'Oval';
}

/**
 * Landmark-driven face shape analysis with heuristic fallback.
 * Swap `detectWithLandmarks` internals for a remote TensorFlow endpoint when ready.
 *
 * @param {string} imageUrl
 * @returns {Promise<{ shape: string, confidence: number, method: 'landmarks' | 'heuristic', ratios?: Record<string, number> }>}
 */
export async function analyzeFaceShape(imageUrl) {
  try {
    const faceapi = await loadLandmarkModels();
    const image = await loadImageElement(imageUrl);

    const detection = await faceapi
      .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
      .withFaceLandmarks(true);

    if (detection?.landmarks) {
      const shape = classifyFaceShapeFromLandmarks(detection.landmarks);
      const faceWidth = distance(detection.landmarks.positions[0], detection.landmarks.positions[16]);
      const faceHeight = distance(detection.landmarks.positions[27], detection.landmarks.positions[8]);
      const jawWidth = distance(detection.landmarks.positions[4], detection.landmarks.positions[12]);

      return {
        shape,
        confidence: Math.round(Math.min(99, detection.detection.score * 100)),
        method: 'landmarks',
        ratios: {
          widthHeight: Number((faceWidth / Math.max(faceHeight, 1)).toFixed(3)),
          jawFace: Number((jawWidth / Math.max(faceWidth, 1)).toFixed(3)),
        },
      };
    }
  } catch (error) {
    console.warn('[analyzeFaceShape] Landmark pipeline unavailable, using heuristic fallback.', error);
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, HEURISTIC_PLACEHOLDER_DELAY_MS);
  });

  const image = await loadImageElement(imageUrl);
  const aspectRatio = image.naturalWidth / Math.max(image.naturalHeight, 1);
  const shape = classifyFaceShapeFromAspectRatio(aspectRatio);

  return {
    shape,
    confidence: 62,
    method: 'heuristic',
    ratios: {
      aspectRatio: Number(aspectRatio.toFixed(3)),
    },
  };
}
