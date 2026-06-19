'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MultiStepOnboarding } from '@/features/profile/components/MultiStepOnboarding';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function ProfileSettingsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated && !accessToken) {
      router.replace('/login/face');
    }
  }, [hydrated, isAuthenticated, accessToken, router]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto overflow-x-hidden">
      <MultiStepOnboarding />
    </div>
  );
}

export default ProfileSettingsPage;
