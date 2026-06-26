'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATALOG_IMAGE_SIZES } from '@/features/catalog/constants/catalogOptions';
import { getExplicitProductGlbUrl } from '@/features/catalog/constants/garmentModels';

const Mini3DViewer = dynamic(() => import('@/components/Mini3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 animate-pulse bg-[#150d22]" aria-hidden />
  ),
});

export function ClosetItemCard({ item, onTryOn, className }) {
  const glbUrl = getExplicitProductGlbUrl(item);
  const hasGlb = Boolean(glbUrl);

  return (
    <article
      className={cn(
        'group wardrobe-card-3d flex flex-col overflow-hidden rounded-2xl border border-borderColor bg-white dark:bg-[#150d22] shadow-md',
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#150d22]">
        {glbUrl ? (
          <Mini3DViewer glbUrl={glbUrl} className="absolute inset-0 rounded-none" />
        ) : (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes={CATALOG_IMAGE_SIZES}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#e91e8c]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {item.source && (
          <span className="absolute left-3 top-3 rounded-full border border-borderColor bg-white dark:bg-[#150d22]/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400 shadow-sm">
            {item.source}
          </span>
        )}

        {hasGlb && onTryOn && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0 max-md:translate-y-0">
            <button
              type="button"
              onClick={() => onTryOn(item)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-magenta py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-magenta/80"
            >
              <Sparkles className="h-3.5 w-3.5" />
              3D Try-On
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1 border-t border-borderColor px-4 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400">
          {item.brand}
        </p>
        <h3 className="font-playfair text-sm font-semibold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-magenta">
          {item.name}
        </h3>
        {item.category && <p className="text-xs text-slate-700 dark:text-gray-400">{item.category}</p>}
      </div>
    </article>
  );
}
