/** @typedef {{ r: number, g: number, b: number }} RgbColor */

/**
 * @param {string} imageUrl
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageElement(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for biometric analysis'));
    image.src = imageUrl;
  });
}

/**
 * @param {HTMLImageElement} image
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export function drawImageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable');
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {RgbColor | null}
 */
export function averageRgbFromRegion(ctx, x, y, width, height) {
  const safeX = Math.max(0, Math.floor(x));
  const safeY = Math.max(0, Math.floor(y));
  const safeW = Math.min(Math.floor(width), ctx.canvas.width - safeX);
  const safeH = Math.min(Math.floor(height), ctx.canvas.height - safeY);

  if (safeW <= 0 || safeH <= 0) return null;

  const { data } = ctx.getImageData(safeX, safeY, safeW, safeH);
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 128) continue;

    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  }

  if (!count) return null;

  return {
    r: Math.round(red / count),
    g: Math.round(green / count),
    b: Math.round(blue / count),
  };
}
