import { z } from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  CAPTURE_STEPS,
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

const capturesSchema = z.object(
  Object.fromEntries(CAPTURE_STEPS.map((step) => [step.id, captureImageSchema])),
);

export const faceRegistrationSchema = z.object({
  captures: capturesSchema,
  livenessVerified: z.literal(true, {
    errorMap: () => ({ message: 'Complete all liveness checks before submitting' }),
  }),
  singleFaceConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'Only one face must be visible in each capture' }),
  }),
});

export function validateCaptureBlob(blob) {
  return captureImageSchema.safeParse(blob);
}

export function validateFaceRegistration(payload) {
  return faceRegistrationSchema.safeParse(payload);
}
