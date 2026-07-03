import { apiClient } from '@/features/auth/services/apiClient';
import { asJpegBlob, compressFaceImage } from '@/features/auth/utils/compressFaceImage';

const FACE_LOGIN_TIMEOUT_MS = 15000;

/**
 * Authenticates the user via face biometrics.
 *
 * @param {Blob} faceBlob - Captured face image (JPEG)
 * @returns {Promise<{ success: boolean, jwt_token: string, user: object }>}
 */
export async function faceLogin(faceBlob) {
  const imageFile = await compressFaceImage(faceBlob);
  const imageBlob = asJpegBlob(imageFile);

  const formData = new FormData();
  formData.append(
    'face',
    imageBlob instanceof File ? imageBlob : new File([imageBlob], 'face.jpg', { type: 'image/jpeg' }),
    'face.jpg',
  );

  return apiClient('/auth/face-login', {
    method: 'POST',
    body: formData,
    timeoutMs: FACE_LOGIN_TIMEOUT_MS,
    cache: 'no-store',
  });
}

/**
 * Authenticates the user with email and password.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, jwt_token: string, user: object }>}
 */
export async function loginWithPassword({ email, password }) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: { email, password },
    timeoutMs: FACE_LOGIN_TIMEOUT_MS,
  });
}
