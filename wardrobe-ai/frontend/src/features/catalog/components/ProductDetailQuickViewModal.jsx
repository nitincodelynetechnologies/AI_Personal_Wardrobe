'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CATALOG_IMAGE_FALLBACK,
  formatCatalogPrice,
  getProductImageFallback,
  resolveProductImageUrl,
} from '@/features/catalog/constants/catalogOptions';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { usePremiumGate } from '@/features/auth/hooks/usePremiumGate';
import { preloadVirtualTryOnModal } from '@/features/try-on/loadVirtualTryOnModal';

const OFFER_TILES = [
  { label: 'Bank Offer', detail: '10% off on HDFC cards' },
  { label: 'No Cost EMI', detail: 'From ₹499/month' },
  { label: 'Partner Offer', detail: 'Extra 5% for members' },
];

const CATEGORY_COPY = {
  Dresses: 'Flowing silhouette crafted from premium breathable fabric with a refined drape for all-day comfort.',
  Tops: 'Soft-touch cotton blend with structured seams — ideal for layering or standalone statement looks.',
  Bottoms: 'Tailored fit with stretch recovery; designed for movement without losing a clean, polished line.',
  Footwear: 'Cushioned insole and durable outsole built for urban wear with elevated finishing details.',
  Men: 'Modern menswear cut with precision tailoring and easy-care fabric for everyday versatility.',
  Women: 'Feminine tailoring with thoughtful details — lightweight, breathable, and wardrobe-ready.',
  Accessories: 'Finishing accent piece designed to complement your core wardrobe palette.',
  default:
    'Premium construction with quality materials selected for comfort, durability, and effortless styling.',
};

function getMockRating(productId) {
  const seed = String(productId)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (4 + (seed % 10) / 10).toFixed(1);
}

function getDeliveryLabel() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
}

function StarRating({ value }) {
  const numeric = Number(value);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'h-3.5 w-3.5',
            index < Math.floor(numeric)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600',
          )}
          aria-hidden
        />
      ))}
      <span className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-400">{value}</span>
    </div>
  );
}

export function ProductDetailQuickViewModal({ product, open, onOpenChange, onTryOn, guestMode = false }) {
  const showToast = useToastStore((state) => state.showToast);
  const { interceptPremium, PremiumGateModal } = usePremiumGate();
  const addToCart = useCartStore((state) => state.addToCart);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);

  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [imageSrc, setImageSrc] = useState(CATALOG_IMAGE_FALLBACK);

  const resolvedSrc = useMemo(
    () => (product ? resolveProductImageUrl(product) : CATALOG_IMAGE_FALLBACK),
    [product],
  );

  useEffect(() => {
    if (!open || !product) return;
    setQuantity(1);
    setActiveThumb(0);
    setImageSrc(resolvedSrc);
  }, [open, product, resolvedSrc]);

  if (!product) return null;

  const salePrice = Number(product.price) || 0;
  const mrp = Math.round(salePrice * 2);
  const discountPct = mrp > 0 ? Math.round((1 - salePrice / mrp) * 100) : 0;
  const rating = getMockRating(product.id);
  const brand = product.brand || 'StyleStudio';
  const description =
    CATEGORY_COPY[product.category] ?? CATEGORY_COPY.default;
  const thumbnails = Array.from({ length: 4 }, (_, index) => ({
    id: `${product.id}-thumb-${index}`,
    src: imageSrc,
  }));

  const handleImageError = () => {
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

    setImageSrc(CATALOG_IMAGE_FALLBACK);
  };

  const handleAddToCart = (event) => {
    interceptPremium(event, () => {
      closeWishlist();
      addToCart(product, quantity);
      showToast({
        message: `${quantity} × ${product.name} added to your bag.`,
        variant: 'success',
      });
      onOpenChange(false);
    });
  };

  const handleTryOn = (event) => {
    interceptPremium(event, () => {
      void preloadVirtualTryOnModal();
      onOpenChange(false);
      onTryOn?.(product);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-6xl gap-0 overflow-y-auto p-0 sm:w-[calc(100%-2rem)]">
        <DialogTitle className="sr-only">{product.name} — product details</DialogTitle>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(260px,0.85fr)]">
          {/* Gallery */}
          <div className="border-b border-borderColor p-4 sm:p-6 lg:border-b-0 lg:border-r dark:border-white/10">
            <div className="aspect-[4/5] overflow-hidden rounded-xl border border-borderColor bg-white dark:border-white/10 dark:bg-[#0f0818]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnails[activeThumb]?.src ?? imageSrc}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {thumbnails.map((thumb, index) => (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => setActiveThumb(index)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-lg border-2 transition-all',
                    activeThumb === index
                      ? 'border-magenta ring-2 ring-magenta/20'
                      : 'border-borderColor opacity-70 hover:opacity-100 dark:border-white/10',
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="border-b border-borderColor p-4 sm:p-6 lg:border-b-0 lg:border-r dark:border-white/10">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Brand: <span className="text-slate-800 dark:text-slate-200">{brand}</span>
            </p>
            <h2 className="mt-2 font-playfair text-2xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-3xl">
              {product.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating value={rating} />
              <span className="text-xs text-slate-500">| {product.category ?? 'Fashion'}</span>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCatalogPrice(salePrice)}
                </p>
                <p className="text-sm text-slate-500 line-through">{formatCatalogPrice(mrp)}</p>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                  -{discountPct}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Inclusive of all taxes</p>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Offers</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {OFFER_TILES.map((offer) => (
                  <div
                    key={offer.label}
                    className="rounded-lg border border-borderColor bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-[#0f0818]"
                  >
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{offer.label}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{offer.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{description}</p>
          </div>

          {/* Action box */}
          <div className="p-4 sm:p-6">
            <div className="rounded-xl border border-borderColor bg-slate-50/80 p-4 dark:border-white/10 dark:bg-[#0f0818]/80">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCatalogPrice(salePrice)}
              </p>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                FREE delivery {getDeliveryLabel()}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">In stock</p>

              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Quantity
                </p>
                <div className="inline-flex items-center rounded-lg border border-borderColor bg-white dark:border-white/10 dark:bg-[#150d22]">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-magenta py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-magenta/90 hover:shadow-[0_0_20px_rgba(233,30,140,0.45)]"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </button>

              <button
                type="button"
                onMouseEnter={() => void preloadVirtualTryOnModal()}
                onFocus={() => void preloadVirtualTryOnModal()}
                onClick={handleTryOn}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-magenta/40 bg-white py-3.5 text-sm font-bold uppercase tracking-wider text-magenta transition-colors hover:bg-magenta/5 dark:bg-[#150d22]"
              >
                <Sparkles className="h-4 w-4 text-violet" />
                Virtual Try-On
              </button>

              <p className="mt-4 text-center text-[10px] text-slate-500">
                Secure checkout · Easy returns within 7 days
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
      <PremiumGateModal />
    </Dialog>
  );
}
