'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATALOG_IMAGE_FALLBACK } from '@/features/catalog/constants/catalogOptions';
import { useToastStore } from '@/components/ui/toaster';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';

export function RecommendationStyleCard({ product, onTryOn, className }) {
  const showToast = useToastStore((state) => state.showToast);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.id === String(product.id)),
  );

  const [imageSrc, setImageSrc] = useState(product.image_url || CATALOG_IMAGE_FALLBACK);

  const category = product.lookCategory ?? 'CURATED';
  const styleName = product.styleName ?? product.name;
  const matchScore = product.matchScore ?? 90;

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    showToast({
      message: added
        ? `${styleName} saved to wishlist.`
        : `${styleName} removed from wishlist.`,
      variant: 'success',
    });
  };

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#150d22] dark:shadow-[0_0_30px_rgba(233,30,140,0.08)]',
        className,
      )}
    >
      <div className="relative aspect-[3/4] min-h-[300px] overflow-hidden">
        <Image
          src={imageSrc}
          alt={styleName}
          fill
          sizes="(max-width: 768px) 72vw, 280px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={() => setImageSrc(CATALOG_IMAGE_FALLBACK)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-obsidian/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          {category}
        </span>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={cn(
            'absolute right-3 top-3 rounded-full border border-white/30 bg-obsidian/40 p-2 text-white backdrop-blur-sm transition-colors',
            isInWishlist && 'border-magenta bg-magenta/80 text-white',
          )}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-current')} />
        </button>

        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            <span>AI Match</span>
            <span className="text-white">{matchScore}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-magenta transition-all duration-700"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <h3 className="font-playfair text-base font-semibold text-slate-900 dark:text-white">
          {styleName}
        </h3>
        <button
          type="button"
          onClick={() => onTryOn?.(product)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta text-white shadow-[0_0_16px_rgba(233,30,140,0.45)] transition-transform hover:scale-105"
          aria-label={`Try on ${styleName}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
