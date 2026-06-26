'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import {
  rehydrateAuthStores,
  syncProfileFromServer,
} from '@/features/profile/utils/profileSync';

export function useOnboardingGuard() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await rehydrateAuthStores();

      const token = useAuthStore.getState().accessToken;
      const authed = useAuthStore.getState().isAuthenticated;

      if (!authed && !token) {
        if (!cancelled) router.replace('/login/face');
        return;
      }

      if (token) {
        try {
          await syncProfileFromServer(token);
        } catch {
          // Fall back to persisted onboarding flag when sync fails.
        }
      }

      const complete = useProfileStore.getState().onboardingComplete;
      if (!cancelled && !complete) {
        router.replace('/onboarding');
        return;
      }

      if (!cancelled) setReady(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return {
    ready,
    onboardingComplete,
    isAuthenticated,
    accessToken,
  };
}
