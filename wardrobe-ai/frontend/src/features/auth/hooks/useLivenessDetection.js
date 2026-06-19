'use client';

import { useCallback, useEffect, useState } from 'react';
import { MVP_LIVENESS_VERIFY_MS } from '@/features/auth/constants/captureSteps';

export function useLivenessDetection({ isActive }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isActive || isVerified) return undefined;

    setIsVerifying(true);
    const timer = setTimeout(() => {
      setIsVerified(true);
      setIsVerifying(false);
    }, MVP_LIVENESS_VERIFY_MS);

    return () => clearTimeout(timer);
  }, [isActive, isVerified]);

  const resetLiveness = useCallback(() => {
    setIsVerified(false);
    setIsVerifying(false);
  }, []);

  return {
    isVerified,
    isVerifying,
    allComplete: isVerified,
    resetLiveness,
  };
}
