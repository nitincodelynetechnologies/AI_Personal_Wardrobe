import { apiClient } from '@/features/auth/services/apiClient';

const FACE_LOGIN_TIMEOUT_MS = 10000;

/**
 * Authenticates the user via face biometrics.
 *
 * @param {Blob} faceBlob - Captured face image (JPEG)
 * @returns {Promise<{ success: boolean, jwt_token: string, user: object }>}
 */
export async function faceLogin(faceBlob) {
  const formData = new FormData();
  formData.append('face', faceBlob, 'face.jpg');

  return apiClient('/auth/face-login', {
    method: 'POST',
    body: formData,
    timeoutMs: FACE_LOGIN_TIMEOUT_MS,
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
