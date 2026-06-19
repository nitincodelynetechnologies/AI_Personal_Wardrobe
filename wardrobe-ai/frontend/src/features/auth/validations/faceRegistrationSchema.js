import { z } from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  FRONT_CAPTURE_STEP,
  MAX_IMAGE_SIZE_BYTES,
} from '@/features/auth/constants/captureSteps';

const captureImageSchema = z
  .instanceof(Blob, { message: 'Capture is required' })
  .refine((blob) => blob.size > 0, 'Image cannot be empty')
  .refine(
    (blob) => blob.size <= MAX_IMAGE_SIZE_BYTES,
    `Image must be under ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB`,
  )
  .refine(
    (blob) => ACCEPTED_IMAGE_TYPES.includes(blob.type),
    'Image must be JPEG, PNG, or WebP',
  );

export const faceRegistrationSchema = z.object({
  captures: z.object({
    [FRONT_CAPTURE_STEP.id]: captureImageSchema,
  }),
  livenessVerified: z.literal(true, {
    errorMap: () => ({ message: 'Complete liveness verification before submitting' }),
  }),
});

export function validateCaptureBlob(blob) {
  return captureImageSchema.safeParse(blob);
}

export function validateFaceRegistration(payload) {
  return faceRegistrationSchema.safeParse(payload);
}
