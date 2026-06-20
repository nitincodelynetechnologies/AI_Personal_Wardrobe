'use client';

import { useMutation } from '@tanstack/react-query';
import { loginWithPassword } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function usePasswordLogin() {
  const completeFaceLogin = useAuthStore((s) => s.completeFaceLogin);

  return useMutation({
    mutationFn: loginWithPassword,
    onSuccess: (data) => {
      completeFaceLogin({
        user: data.user,
        accessToken: data.jwt_token,
      });
    },
  });
}
