import imageCompression from 'browser-image-compression';

const FACE_IMAGE_COMPRESSION = {
  maxSizeMB: 0.35,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

function asJpegFile(blob) {
  if (blob instanceof File) {
    return blob;
  }

  return new File([blob], 'face.jpg', { type: blob.type || 'image/jpeg' });
}

/**
 * Compress a captured face frame before multipart upload (keeps payloads under server limits).
 */
export async function compressFaceImage(blob) {
  return imageCompression(asJpegFile(blob), FACE_IMAGE_COMPRESSION);
}

export function asJpegBlob(blob) {
  if (blob.type === 'image/jpeg' || blob.type === 'image/png' || blob.type === 'image/webp') {
    return blob;
  }

  return new Blob([blob], { type: 'image/jpeg' });
}
