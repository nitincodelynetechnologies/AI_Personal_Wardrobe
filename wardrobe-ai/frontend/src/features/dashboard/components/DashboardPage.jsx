'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { DashboardTopBar } from '@/features/dashboard/components/DashboardTopBar';
import { CuratedForYouSection } from '@/features/dashboard/components/CuratedForYouSection';
import { TrendingThisWeek } from '@/features/dashboard/components/TrendingThisWeek';
import { enrichProductWithLook } from '@/features/dashboard/constants/dashboardStyleLooks';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { PersonalizedHero } from '@/features/recommendations/components/PersonalizedHero';
import { RECOMMENDATION_TYPES } from '@/features/recommendations/constants/recommendationCatalog';
import { getRecommendations } from '@/features/recommendations/utils/getRecommendations';
import { enrichProductWithGlb } from '@/features/catalog/constants/garmentModels';
import { TryOnModalDynamic } from '@/features/try-on/components/TryOnModalDynamic';
import { preloadVirtualTryOnModal } from '@/features/try-on/loadVirtualTryOnModal';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';

export function DashboardPage() {
  const {
    displayName,
    bodyType,
    fashionStyle,
    preferredColors: ownedPreferredColors,
  } = useAuthUser();
  const wishlistItems = useWishlistStore((state) => state.items);
  const wardrobeItems = useWardrobeStore((state) => state.items);

  const { ready } = useOnboardingGuard();
  const { data: catalogProducts = [], isLoading, isError, error } = useProducts('All');

  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadVirtualTryOnModal();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const resolvedBodyType = bodyType ?? 'athletic';
  const preferredColors =
    ownedPreferredColors.length > 0 ? ownedPreferredColors : ['navy', 'black', 'olive'];

  const recommendationContext = useMemo(
    () => ({
      bodyType: resolvedBodyType,
      preferredColors,
      wishlistProductIds: wishlistItems.map((item) => item.id),
      closetProductIds: wardrobeItems.map((item) => item.id),
      limit: 4,
    }),
    [resolvedBodyType, preferredColors, wishlistItems, wardrobeItems],
  );

  const curatedProducts = useMemo(() => {
    const products = getRecommendations(
      RECOMMENDATION_TYPES.BODY,
      recommendationContext,
      catalogProducts,
    );
    return products.map((product, index) => enrichProductWithLook(product, index));
  }, [recommendationContext, catalogProducts]);

  const handleTryOn = useCallback((product) => {
    void preloadVirtualTryOnModal();
    setTryOnProduct(enrichProductWithGlb(product));
    setTryOnOpen(true);
  }, []);

  const handleTryOnOpenChange = useCallback((open) => {
    setTryOnOpen(open);
    if (!open) setTryOnProduct(null);
  }, []);

  const handleHeroTryOn = useCallback(() => {
    if (curatedProducts[0]) {
      handleTryOn(curatedProducts[0]);
    }
  }, [curatedProducts, handleTryOn]);

  if (!ready) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-10">
        <DashboardTopBar />

        <PersonalizedHero
          displayName={displayName}
          bodyType={resolvedBodyType}
          fashionStyle={fashionStyle}
          preferredColors={preferredColors}
          onTryOn={handleHeroTryOn}
        />

        {isError && (
          <Alert variant="destructive" role="alert">
            {getNetworkErrorMessage(error)}
          </Alert>
        )}

        {isLoading && catalogProducts.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Curating your personalized feed...
          </div>
        ) : (
          <>
            <CuratedForYouSection products={curatedProducts} onTryOn={handleTryOn} />
            <TrendingThisWeek onTryOn={handleTryOn} />
          </>
        )}
      </div>

      <TryOnModalDynamic
        open={tryOnOpen}
        onOpenChange={handleTryOnOpenChange}
        product={tryOnProduct}
      />
    </DashboardLayout>
  );
}

export default DashboardPage;
