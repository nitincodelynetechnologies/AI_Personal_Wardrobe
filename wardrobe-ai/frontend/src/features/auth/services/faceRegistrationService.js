import { apiClient } from '@/features/auth/services/apiClient';
import { CAPTURE_STEPS } from '@/features/auth/constants/captureSteps';

/**
 * Submits captured face images to the AI Face Service.
 * Backend generates a 512-D vector and stores it in Qdrant (users_face_vectors).
 *
 * @param {{ captures: Record<string, Blob>, userDetails?: object, token?: string }} params
 * @returns {Promise<{ success: boolean, routingToken: string, user?: object }>}
 */
export async function registerFace({ captures, userDetails = {}, token }) {
  const formData = new FormData();

  CAPTURE_STEPS.forEach((step) => {
    const blob = captures[step.id];
    if (blob) {
      formData.append(step.id, blob, `${step.id}.jpg`);
    }
  });

  if (userDetails.fullName) {
    formData.append('fullName', userDetails.fullName);
  }

  if (userDetails.email) {
    formData.append('email', userDetails.email);
  }

  formData.append('livenessVerified', 'true');

  return apiClient('/auth/face/register', {
    method: 'POST',
    body: formData,
    token,
  });
}
