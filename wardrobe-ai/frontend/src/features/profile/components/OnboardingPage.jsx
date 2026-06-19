'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MultiStepOnboarding } from '@/features/profile/components/MultiStepOnboarding';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export function OnboardingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useProfileStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated && !accessToken) {
      router.replace('/login/face');
      return;
    }

    if (onboardingComplete) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthenticated, accessToken, onboardingComplete, router]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto overflow-x-hidden">
      <MultiStepOnboarding />
    </div>
  );
}

export default OnboardingPage;
