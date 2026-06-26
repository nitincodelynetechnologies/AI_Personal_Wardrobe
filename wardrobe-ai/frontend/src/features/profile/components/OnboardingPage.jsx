'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MultiStepOnboarding } from '@/features/profile/components/MultiStepOnboarding';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  rehydrateAuthStores,
  syncProfileFromServer,
} from '@/features/profile/utils/profileSync';

export function OnboardingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
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
          const { onboardingComplete } = await syncProfileFromServer(token);
          if (!cancelled && onboardingComplete) {
            router.replace('/dashboard');
            return;
          }
        } catch {
          // Allow onboarding form when profile sync fails transiently.
        }
      }

      if (!cancelled) setReady(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return null;
  }

  if (!isAuthenticated && !accessToken) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto overflow-x-hidden">
      <MultiStepOnboarding />
    </div>
  );
}

export default OnboardingPage;
