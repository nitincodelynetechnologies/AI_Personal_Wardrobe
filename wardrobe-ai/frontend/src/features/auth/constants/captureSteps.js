export const FRONT_CAPTURE_STEP = {
  id: 'front',
  label: 'Front Face',
  shortLabel: 'Front',
  instruction: 'Look straight at the camera and align your face within the frame.',
};

/** Single-step capture flow (UI). */
export const CAPTURE_STEPS = [FRONT_CAPTURE_STEP];

/** Backend still expects these multipart fields; front image is reused in MVP. */
export const BACKEND_FACE_POSE_FIELDS = ['front', 'left', 'right', 'smile'];

export const LIVENESS_CHECK = {
  id: 'liveness',
  label: 'Liveness Verification',
  description: 'Confirming you are present…',
};

export const MVP_LIVENESS_VERIFY_MS = 1000;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const FACE_VECTOR_COLLECTION = 'users_face_vectors';
