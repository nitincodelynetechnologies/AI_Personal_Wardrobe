import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: 'image/webp',
};

const FALLBACK_MAX_BYTES = 0.5 * 1024 * 1024;

export async function compressClothingImage(file) {
  try {
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

    if (compressed.size >= file.size && file.size <= FALLBACK_MAX_BYTES) {
      return file;
    }

    return compressed;
  } catch {
    if (file.size <= FALLBACK_MAX_BYTES) {
      return file;
    }

    throw new Error('Unable to compress image. Try a smaller photo or a different format.');
  }
}
