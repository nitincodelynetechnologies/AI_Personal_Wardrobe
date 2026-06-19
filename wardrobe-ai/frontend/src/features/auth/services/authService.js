import { apiClient } from '@/features/auth/services/apiClient';

/**
 * Authenticates the user via face biometrics.
 *
 * @param {Blob} faceBlob - Captured face image (JPEG)
 * @returns {Promise<{ success: boolean, message: string, user: object, jwt_token: string }>}
 */
export async function faceLogin(faceBlob) {
  const formData = new FormData();
  formData.append('face', faceBlob, 'face.jpg');

  return apiClient('/auth/face-login', {
    method: 'POST',
    body: formData,
  });
}
