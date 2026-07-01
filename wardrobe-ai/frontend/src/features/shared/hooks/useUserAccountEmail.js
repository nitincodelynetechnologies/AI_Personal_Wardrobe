'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function getUserAccountEmail(user) {
  return (user?.email ?? user?.Email ?? '').trim().toLowerCase();
}

export function useUserAccountEmail() {
  const user = useAuthStore((state) => state.user);
  return getUserAccountEmail(user);
}
