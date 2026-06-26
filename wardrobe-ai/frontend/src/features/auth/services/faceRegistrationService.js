import { apiClient } from '@/features/auth/services/apiClient';
import { BACKEND_FACE_POSE_FIELDS } from '@/features/auth/constants/captureSteps';

function asJpegBlob(blob) {
  if (blob.type === 'image/jpeg' || blob.type === 'image/png' || blob.type === 'image/webp') {
    return blob;
  }

  return new Blob([blob], { type: 'image/jpeg' });
}

/**
 * Submits a single front-face capture to the registration API.
 * Reuses the front image for legacy pose fields expected by the backend.
 */
export async function registerFace({ captures, userDetails = {}, token }) {
  const frontBlob = captures?.front;

  if (!frontBlob) {
    throw new Error('Front face capture is required');
  }

  const imageBlob = asJpegBlob(frontBlob);
  const formData = new FormData();

  BACKEND_FACE_POSE_FIELDS.forEach((field) => {
    formData.append(field, imageBlob, `${field}.jpg`);
  });

  if (userDetails.email) {
    formData.append('email', userDetails.email);
  }

  if (userDetails.mobile) {
    formData.append('mobile', userDetails.mobile);
  }

  if (userDetails.password) {
    formData.append('password', userDetails.password);
  }

  if (userDetails.name) {
    formData.append('name', userDetails.name);
  }

  const data = await apiClient('/auth/face-register', {
    method: 'POST',
    body: formData,
    token,
  });

  return {
    success: data.success,
    routingToken: data.jwt_token ?? data.routingToken ?? null,
    user: data.user,
  };
}
