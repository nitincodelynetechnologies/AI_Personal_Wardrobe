'use client';

import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatLabel } from '@/features/dashboard/utils/dashboardUtils';
import { RecommendationStyleCard } from '@/features/dashboard/components/RecommendationStyleCard';

export function SmartPickRecommendations({ products, fashionStyle, onTryOn, className }) {
  if (!products?.length) return null;

  const styleLabel = formatLabel(fashionStyle) || 'Your Style';

  return (
    <section className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">
            <Sparkles className="h-3 w-3" aria-hidden />
            Smart Pick
          </p>
          <h2 className="mt-2 font-playfair text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Recommended for Your Style
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Curated from the catalog for your{' '}
            <span className="font-medium text-slate-900 dark:text-slate-200">{styleLabel}</span> profile —
            refreshed with every visit.
          </p>
        </div>
        <Link
          href="/catalog"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-magenta transition-opacity hover:opacity-80"
        >
          Browse catalog
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <RecommendationStyleCard
            key={`${product.id ?? product.sku}-smart-${index}`}
            product={product}
            onTryOn={onTryOn}
          />
        ))}
      </div>
    </section>
  );
}
