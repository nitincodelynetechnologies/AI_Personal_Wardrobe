'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import {
  CATALOG_IMAGE_FALLBACK,
  formatCatalogPrice,
  getProductImageFallback,
  resolveProductImageUrl,
} from '@/features/catalog/constants/catalogOptions';
import { NON_3D_CATALOG_CATEGORIES } from '@/features/catalog/constants/garmentModels';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { preloadVirtualTryOnModal } from '@/features/try-on/loadVirtualTryOnModal';

const Mini3DViewer = dynamic(() => import('@/components/Mini3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 animate-pulse bg-[#150d22]" aria-hidden />
  ),
});

export function ProductCard({ product, onTryOn, className }) {
  const showToast = useToastStore((state) => state.showToast);
  const addToCart = useCartStore((state) => state.addToCart);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.id === String(product.id)),
  );
  const rawGlbUrl = (product.glbUrl ?? product.glb_url)?.trim() || null;
  const glbUrl =
    rawGlbUrl && !NON_3D_CATALOG_CATEGORIES.has(product.category) ? rawGlbUrl : null;
  const is3dTryOn = Boolean(glbUrl);

  const resolvedSrc = resolveProductImageUrl(product);
  const [imageSrc, setImageSrc] = useState(resolvedSrc);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const nextSrc = resolveProductImageUrl(product);
    setImageSrc(nextSrc);
    setIsImageLoading(true);
  }, [product.image_url, product.sku]);

  const handleImageError = () => {
    setIsImageLoading(false);

    const renderAlt = product?.ai_render_image?.trim();
    if (renderAlt && imageSrc !== renderAlt) {
      setImageSrc(renderAlt);
      return;
    }

    const skuFallback = getProductImageFallback(product);
    if (imageSrc !== skuFallback) {
      setImageSrc(skuFallback);
      return;
    }

    if (imageSrc !== CATALOG_IMAGE_FALLBACK) {
      setImageSrc(CATALOG_IMAGE_FALLBACK);
    }
  };

  const handleImageReady = () => {
    setIsImageLoading(false);
  };

  const handleAddToCart = () => {
    closeWishlist();
    addToCart(product);
    showToast({ message: `${product.name} added to your bag.`, variant: 'success' });
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    showToast({
      message: added
        ? `${product.name} saved to wishlist.`
        : `${product.name} removed from wishlist.`,
      variant: 'success',
    });
  };

  return (
    <article className={cn('group flex flex-col', className)}>
      <div className="relative aspect-[3/4] min-h-[280px] overflow-hidden rounded-t-xl bg-white dark:bg-[#150d22] shadow-md">
        {glbUrl ? (
          <Mini3DViewer key={`card-3d-${product.id}-${glbUrl}`} glbUrl={glbUrl} className="absolute inset-0" />
        ) : (
          <>
            {isImageLoading && (
              <div
                className="absolute inset-0 z-[1] animate-pulse bg-white dark:bg-[#150d22]"
                aria-hidden
              />
            )}

            {/* Admin catalog URLs may come from any host — native img avoids next/image allowlist errors */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imageSrc}
              src={imageSrc}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              onLoad={handleImageReady}
              onError={handleImageError}
            />
          </>
        )}

        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />

        {is3dTryOn && (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-magenta/40 bg-obsidian/80 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-magenta backdrop-blur-sm">
            3D Try-On
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={cn(
            'absolute right-3 top-3 z-10 rounded-full border p-2 backdrop-blur-sm transition-all duration-300',
            isInWishlist
              ? 'border-white bg-white dark:bg-[#150d22] text-magenta'
              : 'border-white/40 bg-white/80 dark:bg-[#150d22]/80 text-slate-700 dark:text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100',
          )}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isInWishlist}
        >
          <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-current')} />
        </button>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col gap-2 p-3 transition-transform duration-300 group-hover:translate-y-0 max-md:translate-y-0">
          <button
            type="button"
            onMouseEnter={() => void preloadVirtualTryOnModal()}
            onFocus={() => void preloadVirtualTryOnModal()}
            onClick={() => onTryOn?.(product)}
            className="flex w-full items-center justify-center gap-2 border border-white/80 bg-white dark:bg-[#150d22]/95 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-magenta backdrop-blur-sm transition-colors hover:bg-slate-100 dark:hover:bg-[#1a1028]"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet" />
            Virtual Try-On
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-magenta py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-magenta/80 hover:shadow-[0_0_20px_rgba(233,30,140,0.5)]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="space-y-1 rounded-b-xl border border-t-0 border-borderColor bg-white dark:bg-[#150d22] px-4 py-4 shadow-md">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400">
          {product.brand}
        </p>
        <h3 className="font-playfair text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{formatCatalogPrice(product.price)}</p>
      </div>
    </article>
  );
}
