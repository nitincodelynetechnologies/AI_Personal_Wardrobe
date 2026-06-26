'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/catalog/components/ProductCard';

export function RecommendationCarousel({ title, subtitle, products, onTryOn }) {
  if (!products?.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="font-playfair text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-700 dark:text-gray-400">{subtitle}</p>}
        </div>
        <Link
          href="/catalog"
          className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400 transition-colors hover:text-magenta sm:inline-flex"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-obsidian to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-obsidian to-transparent" />

        <div className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 pt-1 snap-x snap-mandatory">
          {products.map((product, index) => (
            <div
              key={`${product.id ?? product.sku ?? 'product'}-${index}`}
              className="w-[min(72vw,220px)] shrink-0 snap-start sm:w-[240px]"
            >
              <ProductCard product={product} onTryOn={onTryOn} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
