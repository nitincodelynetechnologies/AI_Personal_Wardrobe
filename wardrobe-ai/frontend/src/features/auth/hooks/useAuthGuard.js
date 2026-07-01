'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { rehydrateAuthStores } from '@/features/profile/utils/profileSync';

export function useAuthGuard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await rehydrateAuthStores();
      if (!cancelled) setReady(true);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const authed = ready && (isAuthenticated || Boolean(accessToken));

  const promptAuth = useCallback(
    (mode = 'login') => {
      router.push(mode === 'register' ? '/register/face' : '/login/face');
    },
    [router],
  );

  const interceptAuth = useCallback(
    (event, mode = 'login') => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      promptAuth(mode);
    },
    [promptAuth],
  );

  return {
    ready,
    isAuthenticated: authed,
    promptAuth,
    interceptAuth,
  };
}
