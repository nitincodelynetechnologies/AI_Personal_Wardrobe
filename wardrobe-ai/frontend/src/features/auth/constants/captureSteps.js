export const CAPTURE_STEPS = [
  {
    id: 'front',
    label: 'Front Face',
    shortLabel: 'Front',
    instruction: 'Look straight at the camera and align your face within the frame.',
    icon: 'front',
  },
  {
    id: 'left',
    label: 'Left Profile',
    shortLabel: 'Left',
    instruction: 'Slowly turn your head to the left, showing your profile.',
    icon: 'left',
  },
  {
    id: 'right',
    label: 'Right Profile',
    shortLabel: 'Right',
    instruction: 'Turn your head to the right, showing your other profile.',
    icon: 'right',
  },
  {
    id: 'smile',
    label: 'Smile',
    shortLabel: 'Smile',
    instruction: 'Face the camera and give a natural, relaxed smile.',
    icon: 'smile',
  },
];

export const LIVENESS_CHECKS = [
  {
    id: 'blink',
    label: 'Eye Blink',
    description: 'Blink naturally when prompted',
    icon: 'eye',
  },
  {
    id: 'headMovement',
    label: 'Head Movement',
    description: 'Slowly turn your head left and right',
    icon: 'move',
  },
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const FACE_VECTOR_COLLECTION = 'users_face_vectors';
