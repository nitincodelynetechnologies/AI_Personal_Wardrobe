'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isAdminUser } from '@/features/auth/utils/rbac';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';

/**
 * Redirects non-admin users away from protected admin routes.
 */
export function useAdminGuard({ redirectTo = '/dashboard' } = {}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { ready: onboardingReady } = useOnboardingGuard();
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!onboardingReady) return;

    if (!isAuthenticated || !isAdmin) {
      router.replace(redirectTo);
    }
  }, [onboardingReady, isAuthenticated, isAdmin, redirectTo, router]);

  return {
    ready: onboardingReady && isAuthenticated && isAdmin,
    isAdmin,
  };
}
