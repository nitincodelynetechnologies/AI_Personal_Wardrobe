import {
  averageRgbFromRegion,
  drawImageToCanvas,
  loadImageElement,
} from '@/features/face-studio/utils/imageCanvasUtils';

export const SKIN_TONE_CATEGORIES = ['Fair', 'Light', 'Medium', 'Wheatish', 'Deep'];

const HEURISTIC_PLACEHOLDER_DELAY_MS = 2000;

/**
 * @param {{ r: number, g: number, b: number }} rgb
 * @returns {string}
 */
export function classifySkinToneFromRgb(rgb) {
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

  if (luminance >= 200) return 'Fair';
  if (luminance >= 170) return 'Light';
  if (luminance >= 140) return 'Medium';
  if (luminance >= 110) return 'Wheatish';
  return 'Deep';
}

/**
 * Canvas-based skin tone extraction from cheek / forehead center region.
 *
 * @param {string} imageUrl
 * @param {HTMLCanvasElement | null} [canvasEl]
 * @returns {Promise<{ tone: string, rgb: { r: number, g: number, b: number }, luminance: number }>}
 */
export async function extractSkinTone(imageUrl, canvasEl = null) {
  const image = await loadImageElement(imageUrl);

  let ctx;
  if (canvasEl) {
    canvasEl.width = image.naturalWidth || image.width;
    canvasEl.height = image.naturalHeight || image.height;
    const context = canvasEl.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Canvas 2D context is unavailable');
    }
    context.drawImage(image, 0, 0, canvasEl.width, canvasEl.height);
    ctx = context;
  } else {
    ({ ctx } = drawImageToCanvas(image));
  }

  const regionWidth = Math.floor(ctx.canvas.width * 0.35);
  const regionHeight = Math.floor(ctx.canvas.height * 0.25);
  const regionX = Math.floor((ctx.canvas.width - regionWidth) / 2);
  const regionY = Math.floor(ctx.canvas.height * 0.28);

  const rgb = averageRgbFromRegion(ctx, regionX, regionY, regionWidth, regionHeight);
  if (!rgb) {
    throw new Error('Unable to extract skin pixels from the captured face region');
  }

  const tone = classifySkinToneFromRgb(rgb);
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

  return { tone, rgb, luminance };
}

export { HEURISTIC_PLACEHOLDER_DELAY_MS };
