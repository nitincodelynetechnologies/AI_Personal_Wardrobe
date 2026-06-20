'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { useToastStore } from '@/components/ui/toaster';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { GenerateOutfitButton } from '@/features/outfits/components/GenerateOutfitButton';
import { OutfitGenerationLoader } from '@/features/outfits/components/OutfitGenerationLoader';
import { OutfitsEmptyState } from '@/features/outfits/components/OutfitsEmptyState';
import { OutfitsGrid } from '@/features/outfits/components/OutfitsGrid';
import { OutfitsGridSkeleton } from '@/features/outfits/components/OutfitsGridSkeleton';
import {
  getGenerateOutfitErrorMessage,
  useGenerateOutfit,
} from '@/features/outfits/hooks/useGenerateOutfit';
import { useOutfits } from '@/features/outfits/hooks/useOutfits';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';

export function StyleStudioPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const outfits = useOutfitStore((state) => state.outfits);

  const [hydrated, setHydrated] = useState(false);
  const { isLoading, isError, error } = useOutfits();

  const { mutate: generateOutfit, isPending: isGenerating } = useGenerateOutfit({
    onSuccess: () => {
      showToast({ message: 'New outfit created by AI!', variant: 'success' });
    },
    onError: (submitError) => {
      showToast({
        message: getGenerateOutfitErrorMessage(submitError),
        variant: 'destructive',
      });
    },
  });

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

  const handleGenerate = () => {
    generateOutfit({ season: 'All' });
  };

  if (!hydrated) return null;

  const showEmpty = !isLoading && outfits.length === 0;

  return (
    <DashboardLayout>
      {isGenerating && <OutfitGenerationLoader />}

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Style Studio</p>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">Style Studio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {outfits.length} saved look{outfits.length === 1 ? '' : 's'} from your wardrobe
            </p>
          </div>

          <GenerateOutfitButton
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="self-start sm:self-auto"
          />
        </div>

        {isError && (
          <Alert variant="destructive" role="alert">
            {getNetworkErrorMessage(error)}
          </Alert>
        )}

        {isLoading && outfits.length === 0 ? (
          <OutfitsGridSkeleton />
        ) : showEmpty ? (
          <OutfitsEmptyState onGenerateClick={handleGenerate} isGenerating={isGenerating} />
        ) : (
          <OutfitsGrid outfits={outfits} />
        )}

        {!isLoading && outfits.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Need more variety?{' '}
            <button
              type="button"
              className="text-champagne underline-offset-4 hover:underline"
              onClick={() => router.push('/wardrobe')}
            >
              Add items to your wardrobe
            </button>
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StyleStudioPage;
