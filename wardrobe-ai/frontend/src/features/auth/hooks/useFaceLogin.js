'use client';

import { useMutation } from '@tanstack/react-query';
import { faceLogin } from '@/features/auth/services/authService';
import { validateCaptureBlob } from '@/features/auth/validations/faceRegistrationSchema';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useFaceLogin() {
  const completeFaceLogin = useAuthStore((s) => s.completeFaceLogin);
  const setFaceLoginStatus = useAuthStore((s) => s.setFaceLoginStatus);

  return useMutation({
    mutationFn: async (faceBlob) => {
      const validation = validateCaptureBlob(faceBlob);
      if (!validation.success) {
        const firstError = validation.error.errors[0]?.message || 'Invalid face capture';
        throw new Error(firstError);
      }

      return faceLogin(faceBlob);
    },
    onMutate: () => {
      setFaceLoginStatus('verifying');
    },
    onSuccess: (data) => {
      completeFaceLogin({
        user: data.user,
        accessToken: data.jwt_token,
      });
    },
    onError: () => {
      setFaceLoginStatus('error');
    },
  });
}
