'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { enforceSessionOwnership } from '@/features/auth/utils/sessionLifecycle';
import { isAdminUser } from '@/features/auth/utils/rbac';
import { rehydrateAuthStores } from '@/features/profile/utils/profileSync';

export function SessionIntegrity() {
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      await rehydrateAuthStores();
      if (cancelled) return;

      const { user, isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated || !user) return;

      if (isAdminUser(user) && user.role !== 'admin') {
        useAuthStore.getState().setUser({ ...user, role: 'admin' });
      }

      enforceSessionOwnership();
    }

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
