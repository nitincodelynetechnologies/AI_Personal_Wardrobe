'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { DashboardTopBar } from '@/features/dashboard/components/DashboardTopBar';
import { UserPromoCouponBanner } from '@/features/dashboard/components/UserPromoCouponBanner';
import { DashboardQuickAccess } from '@/features/dashboard/components/DashboardQuickAccess';
import { SmartPickRecommendations } from '@/features/dashboard/components/SmartPickRecommendations';
import { ClosetPulse } from '@/features/dashboard/components/ClosetPulse';
import { DashboardProfileStats } from '@/features/dashboard/components/DashboardProfileStats';
import { enrichProductWithLook } from '@/features/dashboard/constants/dashboardStyleLooks';
import { getRecentWardrobeItems } from '@/features/dashboard/utils/dashboardUtils';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useWardrobe } from '@/features/wardrobe/hooks/useWardrobe';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { PersonalizedHero } from '@/features/recommendations/components/PersonalizedHero';
import { RECOMMENDATION_TYPES } from '@/features/recommendations/constants/recommendationCatalog';
import { getRecommendations } from '@/features/recommendations/utils/getRecommendations';
import { enrichProductWithGlb } from '@/features/catalog/constants/garmentModels';
import { TryOnModalDynamic } from '@/features/try-on/components/TryOnModalDynamic';
import { preloadVirtualTryOnModal } from '@/features/try-on/loadVirtualTryOnModal';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useActiveCoupon } from '@/features/admin/hooks/useActiveCoupon';

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
  const { isLoading: isWardrobeLoading } = useWardrobe();
  const { data: catalogProducts = [], isLoading, isError, error } = useProducts('All');

  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const { activeCoupon } = useActiveCoupon();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadVirtualTryOnModal();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const resolvedBodyType = bodyType ?? 'athletic';
  const resolvedFashionStyle = fashionStyle ?? 'casual';
  const preferredColors =
    ownedPreferredColors.length > 0 ? ownedPreferredColors : ['navy', 'black', 'olive'];

  const smartPickProducts = useMemo(() => {
    const products = getRecommendations(
      RECOMMENDATION_TYPES.STYLE,
      {
        fashionStyle: resolvedFashionStyle,
        bodyType: resolvedBodyType,
        preferredColors,
        wishlistProductIds: wishlistItems.map((item) => item.id),
        closetProductIds: wardrobeItems.map((item) => item.id),
        limit: 4,
      },
      catalogProducts,
    );

    return products.map((product, index) => enrichProductWithLook(product, index));
  }, [
    resolvedFashionStyle,
    resolvedBodyType,
    preferredColors,
    wishlistItems,
    wardrobeItems,
    catalogProducts,
  ]);

  const recentWardrobeItems = useMemo(
    () => getRecentWardrobeItems(wardrobeItems, 3),
    [wardrobeItems],
  );

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
    if (smartPickProducts[0]) {
      handleTryOn(smartPickProducts[0]);
    }
  }, [smartPickProducts, handleTryOn]);

  if (!ready) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <UserPromoCouponBanner coupon={activeCoupon} />

        <DashboardTopBar />

        <PersonalizedHero
          displayName={displayName}
          bodyType={resolvedBodyType}
          fashionStyle={resolvedFashionStyle}
          preferredColors={preferredColors}
          onTryOn={handleHeroTryOn}
        />

        <DashboardQuickAccess />

        {isError && (
          <Alert variant="destructive" role="alert">
            {getNetworkErrorMessage(error)}
          </Alert>
        )}

        {isLoading && catalogProducts.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-magenta" />
            Curating your Smart Pick feed...
          </div>
        ) : (
          <SmartPickRecommendations
            products={smartPickProducts}
            fashionStyle={resolvedFashionStyle}
            onTryOn={handleTryOn}
          />
        )}

        <ClosetPulse items={recentWardrobeItems} isLoading={isWardrobeLoading} />

        <DashboardProfileStats />
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
