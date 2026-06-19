'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { DashboardGreeting } from '@/features/dashboard/components/DashboardGreeting';
import { FashionDNACard } from '@/features/dashboard/components/FashionDNACard';
import { EmptyWardrobeState } from '@/features/dashboard/components/EmptyWardrobeState';
import { EmptyRecommendationsState } from '@/features/dashboard/components/EmptyRecommendationsState';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);
  const cachedFashionDna = useProfileStore((s) => s.fashionDna);
  const cachedProfile = useProfileStore((s) => s.profile);
  const cachedPreferences = useProfileStore((s) => s.preferences);

  const [hydrated, setHydrated] = useState(false);
  const { data, isLoading, isError, error } = useDashboard();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useProfileStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated && !accessToken) {
      router.replace('/login/face');
      return;
    }

    if (!onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [hydrated, isAuthenticated, accessToken, onboardingComplete, router]);

  if (!hydrated) {
    return null;
  }

  const profile = data?.profile ?? cachedProfile;
  const preferences = data?.preferences ?? cachedPreferences;
  const fashionDna = data?.fashionDna ?? cachedFashionDna;

  return (
    <DashboardLayout>
      {isLoading && !data && !cachedFashionDna ? (
        <DashboardSkeleton />
      ) : (
        <div className="mx-auto max-w-6xl space-y-8">
          <DashboardGreeting user={user} profile={profile} preferences={preferences} />

          {isError && (
            <Alert variant="destructive" role="alert">
              {getNetworkErrorMessage(error)}
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          {!onboardingComplete && (
            <Alert>
              Complete your style profile to unlock full Fashion DNA insights.{' '}
              <Link href="/onboarding" className="font-medium text-champagne underline">
                Go to onboarding
              </Link>
            </Alert>
          )}

          <FashionDNACard fashionDna={fashionDna} preferences={preferences} />

          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyWardrobeState />
            <EmptyRecommendationsState />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
