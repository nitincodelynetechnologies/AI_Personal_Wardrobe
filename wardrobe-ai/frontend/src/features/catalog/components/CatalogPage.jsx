'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useOnboardingGuard } from '@/features/profile/hooks/useOnboardingGuard';
import { CatalogSidebar } from '@/features/catalog/components/CatalogSidebar';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { ProductDetailQuickViewModal } from '@/features/catalog/components/ProductDetailQuickViewModal';
import { CATALOG_CATEGORIES } from '@/features/catalog/constants/catalogOptions';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { enrichProductWithGlb } from '@/features/catalog/constants/garmentModels';
import { filterCatalogByCategory, buildMergedCatalog, filterCatalogBySearch } from '@/features/catalog/services/catalogService';
import {
  GLOBAL_CATALOG_KEY,
  GLOBAL_CATALOG_UPDATED_EVENT,
} from '@/features/catalog/utils/globalCatalogStorage';
import { TryOnModalDynamic } from '@/features/try-on/components/TryOnModalDynamic';
import { preloadVirtualTryOnModal } from '@/features/try-on/loadVirtualTryOnModal';
import { useGuestAccess } from '@/features/auth/hooks/useGuestAccess';
import { GuestCatalogShell } from '@/features/catalog/components/GuestCatalogShell';

export function CatalogPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search')?.trim() ?? '';
  const [activeCategory, setActiveCategory] = useState('All');
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { ready } = useOnboardingGuard();
  const { ready: guestReady, isGuest } = useGuestAccess();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading, isError, error, refetch } = useProducts(activeCategory);

  useEffect(() => {
    refetch();

    const handleCatalogUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === GLOBAL_CATALOG_KEY) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    };

    window.addEventListener(GLOBAL_CATALOG_UPDATED_EVENT, handleCatalogUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(GLOBAL_CATALOG_UPDATED_EVENT, handleCatalogUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient, refetch]);

  const filteredProducts = useMemo(() => {
    const byCategory = filterCatalogByCategory(buildMergedCatalog(), activeCategory);
    return filterCatalogBySearch(byCategory, searchTerm);
  }, [activeCategory, products, searchTerm]);

  const handleTryOn = useCallback((product) => {
    void preloadVirtualTryOnModal();
    setTryOnProduct(enrichProductWithGlb(product));
    setTryOnOpen(true);
  }, []);

  const handleTryOnOpenChange = useCallback((open) => {
    setTryOnOpen(open);
    if (!open) setTryOnProduct(null);
  }, []);

  const handleViewDetails = useCallback((product) => {
    setDetailProduct(product);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open) => {
    setDetailOpen(open);
    if (!open) setDetailProduct(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadVirtualTryOnModal();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  if (!ready || !guestReady) {
    return null;
  }

  const catalogBody = (
    <>
      <div
        className={
          isGuest
            ? 'mx-auto max-w-7xl px-4 py-8 sm:px-8'
            : 'scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:p-6 md:pb-8 lg:p-8'
        }
      >
        <header className={isGuest ? 'mb-8 border-b border-borderColor pb-6' : 'mb-8 shrink-0 border-b border-borderColor pb-6'}>
          <h1 className="font-playfair text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {isGuest ? 'Browse Collection' : 'Product Catalog'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-gray-400">
            {searchTerm ? (
              <>
                Showing results for &ldquo;<span className="font-medium text-slate-900 dark:text-white">{searchTerm}</span>&rdquo;
                {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.
              </>
            ) : isGuest ? (
              'Explore premium trends — sign in to try on, save looks, and checkout.'
            ) : (
              'Curated essentials from premium labels. Discover pieces that complement your virtual wardrobe.'
            )}
          </p>

          {isGuest ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {CATALOG_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={
                    activeCategory === category.value
                      ? 'border border-magenta bg-magenta px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-magenta/80'
                      : 'border border-borderColor bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition-colors hover:border-magenta/30 hover:text-slate-900 dark:bg-[#150d22] dark:text-gray-400 dark:hover:text-white'
                  }
                >
                  {category.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
              {CATALOG_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={
                    activeCategory === category.value
                      ? 'border border-magenta bg-magenta px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-magenta/80'
                      : 'border border-borderColor bg-white dark:bg-[#150d22] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400 shadow-sm transition-colors hover:border-magenta/30 hover:text-slate-900 dark:hover:text-white'
                  }
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {isError && (
          <Alert variant="destructive" className="mb-6">
            {getNetworkErrorMessage(error)}
          </Alert>
        )}

        {isLoading && filteredProducts.length === 0 ? (
          <div className="flex items-center gap-2 py-20 text-sm text-slate-700 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin text-magenta" />
            Loading catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-700 dark:text-gray-400">
            {searchTerm ? (
              <>
                No styles found matching &ldquo;{searchTerm}&rdquo;. Try searching for &lsquo;men&rsquo; or
                &lsquo;women&rsquo;.
              </>
            ) : (
              'No products found in this category.'
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onTryOn={handleTryOn}
                onViewDetails={handleViewDetails}
                guestMode={isGuest}
              />
            ))}
          </div>
        )}
      </div>

      <ProductDetailQuickViewModal
        product={detailProduct}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        onTryOn={handleTryOn}
        guestMode={isGuest}
      />

      {!isGuest && (
        <TryOnModalDynamic open={tryOnOpen} onOpenChange={handleTryOnOpenChange} product={tryOnProduct} />
      )}
    </>
  );

  if (isGuest) {
    return <GuestCatalogShell>{catalogBody}</GuestCatalogShell>;
  }

  return (
    <DashboardLayout>
      <div className="flex h-full min-h-0 w-full overflow-hidden">
        <CatalogSidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        {catalogBody}
      </div>
    </DashboardLayout>
  );
}

export default CatalogPage;
