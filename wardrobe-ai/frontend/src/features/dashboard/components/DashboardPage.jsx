'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { DashboardGreeting } from '@/features/dashboard/components/DashboardGreeting';
import { FashionDNACard } from '@/features/dashboard/components/FashionDNACard';
import { RecentWardrobeWidget } from '@/features/dashboard/components/RecentWardrobeWidget';
import { FeaturedOutfitWidget } from '@/features/dashboard/components/FeaturedOutfitWidget';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import {
  getLatestOutfit,
  getRecentWardrobeItems,
} from '@/features/dashboard/utils/dashboardUtils';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const cachedFashionDna = useProfileStore((state) => state.fashionDna);
  const cachedProfile = useProfileStore((state) => state.profile);
  const cachedPreferences = useProfileStore((state) => state.preferences);
  const cachedWardrobeItems = useDashboardStore((state) => state.wardrobeItems);
  const cachedOutfits = useDashboardStore((state) => state.outfits);

  const [hydrated, setHydrated] = useState(false);
  const { data, isLoading, isFetching, isError, error } = useDashboard();

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
  const wardrobeItems = data?.wardrobeItems ?? cachedWardrobeItems;
  const outfits = data?.outfits ?? cachedOutfits;
  const recentItems = getRecentWardrobeItems(wardrobeItems);
  const latestOutfit = getLatestOutfit(outfits);
  const showInitialSkeleton =
    isLoading && !data && !cachedFashionDna && !wardrobeItems.length && !outfits.length;
  const widgetsLoading = (isLoading || isFetching) && !recentItems.length && !latestOutfit;

  return (
    <DashboardLayout>
      {showInitialSkeleton ? (
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
            <RecentWardrobeWidget items={recentItems} isLoading={widgetsLoading} />
            <FeaturedOutfitWidget outfit={latestOutfit} isLoading={widgetsLoading} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
