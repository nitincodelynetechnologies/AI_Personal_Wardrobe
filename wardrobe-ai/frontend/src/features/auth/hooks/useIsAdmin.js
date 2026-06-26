'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isAdminUser } from '@/features/auth/utils/rbac';

export function useIsAdmin() {
  const user = useAuthStore((state) => state.user);
  return isAdminUser(user);
}
