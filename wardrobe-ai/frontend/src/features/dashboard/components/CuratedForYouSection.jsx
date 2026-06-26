'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecommendationStyleCard } from '@/features/dashboard/components/RecommendationStyleCard';
import { CURATION_FILTERS } from '@/features/dashboard/constants/dashboardStyleLooks';

export function CuratedForYouSection({ products, onTryOn }) {
  const [activeFilter, setActiveFilter] = useState('best-match');

  if (!products?.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="font-playfair text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Curated For Your Body Type
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            AI-ranked based on your fashion DNA, body geometry, colour affinity, and mood upgrade
            refreshed for today.
          </p>
        </div>
        <Link
          href="/catalog"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-magenta transition-opacity hover:opacity-80"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {CURATION_FILTERS.map((filter) => {
          const active = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                active
                  ? 'bg-magenta text-white shadow-[0_0_20px_rgba(233,30,140,0.35)]'
                  : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-magenta/30 dark:border-borderColor dark:bg-[#1a1025]/50 dark:text-slate-300 dark:shadow-none',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <RecommendationStyleCard
            key={`${product.id ?? product.sku}-${index}`}
            product={product}
            onTryOn={onTryOn}
          />
        ))}
      </div>
    </section>
  );
}
