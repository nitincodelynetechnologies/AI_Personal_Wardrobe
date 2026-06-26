const DEFAULT_SHIRT_COLOR = '#f4f4f5';
const DEFAULT_PANT_COLOR = '#1e293b';
const SKIN_COLOR = '#c9a27a';

function readDominantColor(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 16) {
    const alpha = data[i + 3];
    if (alpha < 40) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }

  if (!count) return DEFAULT_SHIRT_COLOR;

  const toHex = (value) => Math.round(value / count).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load garment image: ${url}`));
    img.src = url;
  });
}

/**
 * Extract shirt swatch, dominant shirt/pant colors from a catalog product photo.
 * Crops the upper-center (shirt) and lower-center (pants) regions of the model shot.
 */
export async function extractGarmentAssets(imageUrl) {
  if (!imageUrl) {
    return {
      shirtTextureUrl: null,
      shirtColor: DEFAULT_SHIRT_COLOR,
      pantColor: DEFAULT_PANT_COLOR,
      skinColor: SKIN_COLOR,
    };
  }

  try {
    const img = await loadImage(imageUrl);
    const { width, height } = img;

    const shirtCanvas = document.createElement('canvas');
    shirtCanvas.width = 512;
    shirtCanvas.height = 512;
    const shirtCtx = shirtCanvas.getContext('2d');
    shirtCtx.drawImage(
      img,
      width * 0.18,
      height * 0.1,
      width * 0.64,
      height * 0.42,
      0,
      0,
      512,
      512,
    );

    const pantCanvas = document.createElement('canvas');
    pantCanvas.width = 256;
    pantCanvas.height = 256;
    const pantCtx = pantCanvas.getContext('2d');
    pantCtx.drawImage(
      img,
      width * 0.22,
      height * 0.5,
      width * 0.56,
      height * 0.38,
      0,
      0,
      256,
      256,
    );

    return {
      shirtTextureUrl: shirtCanvas.toDataURL('image/jpeg', 0.9),
      shirtColor: readDominantColor(shirtCtx, 512, 512),
      pantColor: readDominantColor(pantCtx, 256, 256),
      skinColor: SKIN_COLOR,
    };
  } catch {
    return {
      shirtTextureUrl: null,
      shirtColor: DEFAULT_SHIRT_COLOR,
      pantColor: DEFAULT_PANT_COLOR,
      skinColor: SKIN_COLOR,
    };
  }
}
