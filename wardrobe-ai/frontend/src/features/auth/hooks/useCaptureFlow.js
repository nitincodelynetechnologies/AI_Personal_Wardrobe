'use client';

import { useCallback, useState } from 'react';
import { validateCaptureBlob } from '@/features/auth/validations/faceRegistrationSchema';

export function useCaptureFlow() {
  const [frontCapture, setFrontCapture] = useState(null);
  const [captureError, setCaptureError] = useState(null);

  const saveCapture = useCallback(async (blob) => {
    setCaptureError(null);

    const validation = validateCaptureBlob(blob);
    if (!validation.success) {
      setCaptureError(validation.error.errors[0]?.message || 'Invalid capture');
      return false;
    }

    setFrontCapture(blob);
    return true;
  }, []);

  const resetCaptures = useCallback(() => {
    setFrontCapture(null);
    setCaptureError(null);
  }, []);

  return {
    frontCapture,
    captures: frontCapture ? { front: frontCapture } : {},
    captureError,
    isComplete: Boolean(frontCapture),
    saveCapture,
    resetCaptures,
  };
}
