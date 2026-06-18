'use client';

import { useCallback, useState } from 'react';
import { CAPTURE_STEPS } from '@/features/auth/constants/captureSteps';
import { validateCaptureBlob } from '@/features/auth/validations/faceRegistrationSchema';

export function useCaptureFlow() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [captures, setCaptures] = useState({});
  const [captureError, setCaptureError] = useState(null);

  const currentStep = CAPTURE_STEPS[currentStepIndex];
  const isComplete = currentStepIndex >= CAPTURE_STEPS.length;
  const progress = (Object.keys(captures).length / CAPTURE_STEPS.length) * 100;

  const saveCapture = useCallback(
    async (blob) => {
      setCaptureError(null);

      const validation = validateCaptureBlob(blob);
      if (!validation.success) {
        setCaptureError(validation.error.errors[0]?.message || 'Invalid capture');
        return false;
      }

      const stepId = CAPTURE_STEPS[currentStepIndex].id;
      setCaptures((prev) => ({ ...prev, [stepId]: blob }));

      if (currentStepIndex < CAPTURE_STEPS.length - 1) {
        setCurrentStepIndex((i) => i + 1);
      } else {
        setCurrentStepIndex(CAPTURE_STEPS.length);
      }

      return true;
    },
    [currentStepIndex],
  );

  const retakeStep = useCallback((stepId) => {
    const stepIndex = CAPTURE_STEPS.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    setCaptures((prev) => {
      const next = { ...prev };
      delete next[stepId];
      CAPTURE_STEPS.slice(stepIndex + 1).forEach((s) => delete next[s.id]);
      return next;
    });
    setCurrentStepIndex(stepIndex);
    setCaptureError(null);
  }, []);

  const resetCaptures = useCallback(() => {
    setCaptures({});
    setCurrentStepIndex(0);
    setCaptureError(null);
  }, []);

  return {
    currentStep,
    currentStepIndex,
    captures,
    captureError,
    isComplete,
    progress,
    saveCapture,
    retakeStep,
    resetCaptures,
  };
}
