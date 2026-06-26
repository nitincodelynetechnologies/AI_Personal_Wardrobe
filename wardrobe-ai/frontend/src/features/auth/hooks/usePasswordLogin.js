'use client';

import { useMutation } from '@tanstack/react-query';
import { loginWithPassword } from '@/features/auth/services/authService';
import { establishAuthenticatedSession } from '@/features/auth/utils/sessionLifecycle';

export function usePasswordLogin() {
  return useMutation({
    mutationFn: loginWithPassword,
    onSuccess: async (data) => {
      await establishAuthenticatedSession({
        user: data.user,
        accessToken: data.jwt_token,
      });
    },
  });
}
