'use client';

import { useMutation } from '@tanstack/react-query';
import { registerFace } from '@/features/auth/services/faceRegistrationService';
import { validateFaceRegistration } from '@/features/auth/validations/faceRegistrationSchema';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { establishAuthenticatedSession } from '@/features/auth/utils/sessionLifecycle';

export function useFaceRegistration() {
  const accessToken = useAuthStore((s) => s.accessToken);
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
    onSuccess: async (data) => {
      await establishAuthenticatedSession({
        user: data.user,
        accessToken: data.routingToken ?? data.jwt_token,
        routingToken: data.routingToken,
        isRegistration: true,
      });
    },
    onError: () => {
      setFaceRegistrationStatus('error');
    },
  });
}
