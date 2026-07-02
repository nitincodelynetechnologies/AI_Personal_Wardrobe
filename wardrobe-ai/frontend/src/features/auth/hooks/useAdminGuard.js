'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isAdminUser } from '@/features/auth/utils/rbac';
import { rehydrateAuthStores } from '@/features/profile/utils/profileSync';

/**
 * Redirects non-admin users away from protected admin routes.
 * Waits for persisted auth to rehydrate before evaluating access.
 */
export function useAdminGuard({ redirectTo = '/dashboard' } = {}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await rehydrateAuthStores();
      if (!cancelled) {
        setHydrated(true);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login/face');
      return;
    }

    if (!isAdmin) {
      router.replace(redirectTo);
    }
  }, [hydrated, isAuthenticated, isAdmin, redirectTo, router]);

  return {
    ready: hydrated && isAuthenticated && isAdmin,
    isAdmin,
  };
}
