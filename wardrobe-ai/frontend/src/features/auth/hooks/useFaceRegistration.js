'use client';

import { useMutation } from '@tanstack/react-query';
import { registerFace } from '@/features/auth/services/faceRegistrationService';
import { validateFaceRegistration } from '@/features/auth/validations/faceRegistrationSchema';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useFaceRegistration() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const completeFaceRegistration = useAuthStore((s) => s.completeFaceRegistration);
  const setFaceRegistrationStatus = useAuthStore((s) => s.setFaceRegistrationStatus);

  return useMutation({
    mutationFn: async ({ captures, livenessVerified, userDetails }) => {
      const validation = validateFaceRegistration({
        captures,
        livenessVerified,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0]?.message || 'Validation failed';
        throw new Error(firstError);
      }

      return registerFace({
        captures,
        userDetails,
        token: accessToken,
      });
    },
    onMutate: () => {
      setFaceRegistrationStatus('submitting');
    },
    onSuccess: (data) => {
      completeFaceRegistration({
        routingToken: data.routingToken,
        accessToken: data.routingToken,
        user: data.user,
      });
    },
    onError: () => {
      setFaceRegistrationStatus('error');
    },
  });
}
