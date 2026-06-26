import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

/** 1×1 neutral pixel — safe default when garment texture is not ready */
export const TEXTURE_PLACEHOLDER_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAD0lEQVQ42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export function isSafeTextureUrl(url) {
  if (!url) return false;
  return (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/') ||
    url.startsWith('./')
  );
}

function configureTextureLoader(loader) {
  loader.setCrossOrigin('anonymous');
}

/**
 * Three.js TextureLoader with CORS enabled — required for Unsplash and other CDNs.
 */
export function useCrossOriginTexture(url) {
  const source = url || TEXTURE_PLACEHOLDER_PIXEL;
  return useLoader(TextureLoader, source, configureTextureLoader);
}

/**
 * Pick a URL that is safe to pass into Three.js without tripping CORS.
 * Remote http(s) URLs are avoided — callers should convert via canvas first.
 */
export function pickGarmentTextureUrl(garmentAssets) {
  const extracted = garmentAssets?.shirtTextureUrl;
  if (extracted && isSafeTextureUrl(extracted)) return extracted;
  return TEXTURE_PLACEHOLDER_PIXEL;
}
