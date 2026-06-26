'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { getFashionDna } from '@/features/dashboard/services/dashboardService';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useOutfits } from '@/features/outfits/hooks/useOutfits';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { ClosetProfileHeader } from '@/features/closet/components/ClosetProfileHeader';
import { ClosetTabs } from '@/features/closet/components/ClosetTabs';
import { ClosetPolaroidCard } from '@/features/closet/components/ClosetPolaroidCard';
import { ClosetVtonLookCard } from '@/features/closet/components/ClosetVtonLookCard';
import { ClosetFashionDnaPanel } from '@/features/closet/components/ClosetFashionDnaPanel';
import { useSavedLooks } from '@/features/closet/hooks/useSavedLooks';
import { MOCK_FASHION_DNA } from '@/features/closet/constants/closetMockData';

export function ClosetPage() {
  const { ready } = useOnboardingGuard();
  const { userId } = useAuthUser();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const preferences = useProfileStore((state) => state.preferences);
  const cachedFashionDna = useProfileStore((state) => state.fashionDna);
  const setFashionDna = useProfileStore((state) => state.setFashionDna);

  const [activeTab, setActiveTab] = useState('dna');
  const [fashionDna, setLocalFashionDna] = useState(cachedFashionDna);
  const [dnaLoading, setDnaLoading] = useState(false);

  const savedLooks = useSavedLooks(userId);

  const {
    data: outfits = [],
    isLoading: outfitsLoading,
    isError: outfitsError,
    error: outfitsErr,
  } = useOutfits();

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    setDnaLoading(true);

    getFashionDna(accessToken)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setLocalFashionDna(data);
          setFashionDna(data);
        }
      })
      .catch(() => {
        // Fall back to cached or mock DNA.
      })
      .finally(() => {
        if (!cancelled) setDnaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, setFashionDna]);

  const displayFashionDna = fashionDna || cachedFashionDna || MOCK_FASHION_DNA;
  const usingMockDna = !fashionDna && !cachedFashionDna;
  const hasVtonLooks = savedLooks.length > 0;
  const hasGeneratedOutfits = outfits.length > 0;

  if (!ready) return null;

  const isLoading =
    (activeTab === 'looks' && outfitsLoading && !hasVtonLooks && !hasGeneratedOutfits) ||
    (activeTab === 'dna' && dnaLoading && !fashionDna && !cachedFashionDna);

  return (
    <DashboardLayout>
      <div className="scandi-page">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
          <ClosetProfileHeader
            user={user}
            profile={profile}
            lookCount={savedLooks.length || outfits.length}
          />

          <div className="mt-8">
            <ClosetTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="mt-8">
            {outfitsError && (
              <Alert variant="destructive" className="mb-6">
                {getNetworkErrorMessage(outfitsErr)}
              </Alert>
            )}

            {isLoading ? (
              <div className="flex items-center gap-2 py-20 text-sm text-slate-700 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-magenta" />
                Loading your closet...
              </div>
            ) : (
              <>
                {activeTab === 'dna' && (
                  <ClosetFashionDnaPanel
                    fashionDna={displayFashionDna}
                    profile={profile}
                    preferences={preferences}
                    usingMock={usingMockDna}
                  />
                )}

                {activeTab === 'looks' && (
                  <section className="space-y-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="font-playfair text-xl font-semibold text-slate-900 dark:text-white">
                          Saved Looks
                        </h2>
                        <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">
                          Virtual try-on fits and AI-generated outfits from your wardrobe.
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="self-start border-borderColor bg-white text-slate-900 hover:border-magenta/30 hover:bg-slate-100 dark:bg-[#150d22] dark:text-white dark:hover:bg-[#1a1028]"
                      >
                        <Link href="/outfits">Generate New Look</Link>
                      </Button>
                    </div>

                    {hasVtonLooks ? (
                      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {savedLooks.map((look) => (
                          <ClosetVtonLookCard key={look.id} look={look} />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full py-12 text-center">
                        <p className="text-sm text-slate-400">
                          You haven&apos;t saved any customized AI looks yet.
                        </p>
                      </div>
                    )}

                    {hasGeneratedOutfits && (
                      <div className="space-y-4 border-t border-borderColor pt-8">
                        <h3 className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">
                          AI Outfit Combos
                        </h3>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                          {outfits.map((outfit, index) => (
                            <ClosetPolaroidCard
                              key={outfit.id}
                              outfit={outfit}
                              rotation={index % 2 === 0 ? -1.5 : 1.5}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ClosetPage;
