'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/components/ui/toaster';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { getFashionDna } from '@/features/dashboard/services/dashboardService';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useOutfits } from '@/features/outfits/hooks/useOutfits';
import { ClosetProfileHeader } from '@/features/closet/components/ClosetProfileHeader';
import { ClosetTabs } from '@/features/closet/components/ClosetTabs';
import { ClosetVtonLookCard } from '@/features/closet/components/ClosetVtonLookCard';
import { ClosetFashionDnaPanel } from '@/features/closet/components/ClosetFashionDnaPanel';
import {
  PERSONAL_CLOSET_UPDATED_EVENT,
  readPersonalCloset,
  removeFromPersonalCloset,
  VTON_PERSONAL_CLOSET_KEY,
} from '@/features/closet/utils/personalClosetStorage';
import { MOCK_FASHION_DNA } from '@/features/closet/constants/closetMockData';

export function ClosetPage() {
  const { ready } = useOnboardingGuard();
  const showToast = useToastStore((state) => state.showToast);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const preferences = useProfileStore((state) => state.preferences);
  const cachedFashionDna = useProfileStore((state) => state.fashionDna);
  const setFashionDna = useProfileStore((state) => state.setFashionDna);

  const [activeTab, setActiveTab] = useState('dna');
  const [fashionDna, setLocalFashionDna] = useState(cachedFashionDna);
  const [dnaLoading, setDnaLoading] = useState(false);
  const [closetItems, setClosetItems] = useState([]);

  const loadClosetItems = useCallback(() => {
    setClosetItems(readPersonalCloset());
  }, []);

  useEffect(() => {
    loadClosetItems();

    const handleStorage = (event) => {
      if (!event.key || event.key === VTON_PERSONAL_CLOSET_KEY) {
        loadClosetItems();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener(PERSONAL_CLOSET_UPDATED_EVENT, loadClosetItems);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(PERSONAL_CLOSET_UPDATED_EVENT, loadClosetItems);
      }
    };
  }, [loadClosetItems]);

  const handleDeleteFromCloset = useCallback(
    (itemId) => {
      const removed = removeFromPersonalCloset(itemId);
      if (!removed) {
        showToast({
          message: 'Could not remove this look. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setClosetItems(readPersonalCloset());
      showToast({
        message: 'Look removed from your Personal Closet.',
        variant: 'default',
      });
    },
    [showToast],
  );

  const {
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
  const hasClosetItems = closetItems.length > 0;

  if (!ready) return null;

  const isLoading = activeTab === 'dna' && dnaLoading && !fashionDna && !cachedFashionDna;

  return (
    <DashboardLayout>
      <div className="scandi-page">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
          <ClosetProfileHeader
            user={user}
            profile={profile}
            lookCount={closetItems.length}
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
                          Outfits you save from Style Studio appear here instantly.
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="self-start border-borderColor bg-white text-slate-900 hover:border-magenta/30 hover:bg-slate-100 dark:bg-[#150d22] dark:text-white dark:hover:bg-[#1a1028]"
                      >
                        <Link href="/outfits">Open Style Studio</Link>
                      </Button>
                    </div>

                    {hasClosetItems ? (
                      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
                        {closetItems.map((look) => (
                          <ClosetVtonLookCard
                            key={look.id}
                            look={look}
                            onDelete={handleDeleteFromCloset}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full rounded-2xl border border-dashed border-borderColor bg-slate-50/50 px-6 py-16 text-center dark:bg-[#150d22]/40">
                        <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                          Your closet is empty. Style some outfits in the Studio to save them here!
                        </p>
                        <Button
                          asChild
                          className="mt-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500"
                        >
                          <Link href="/outfits">Go to Style Studio</Link>
                        </Button>
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
