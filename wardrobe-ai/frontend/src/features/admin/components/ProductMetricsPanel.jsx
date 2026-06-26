'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const METRIC_THUMB = '40px';

function RankBadge({ index }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1a1028] text-xs font-bold text-slate-300">
      {String(index + 1).padStart(2, '0')}
    </div>
  );
}

export function ProductMetricsPanel({
  title,
  subtitle,
  products,
  variant = 'thumb',
  compact = false,
}) {
  const isRanked = variant === 'ranked';
  const visibleProducts = products.slice(0, compact ? 3 : products.length);

  return (
    <div className={compact ? '' : 'h-full'}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
        {subtitle}
      </p>
      <h3 className="mt-1 font-playfair text-2xl font-semibold text-white">{title}</h3>

      <ul className={cn('space-y-6', compact ? 'mt-4' : 'mt-8')}>
        {visibleProducts.map((product, index) => {
          const width = Math.max(12, Math.round((product.count / product.max) * 100));

          return (
            <li key={product.id}>
              <div className="mb-2.5 flex items-center gap-3">
                {isRanked ? (
                  <RankBadge index={index} />
                ) : (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#1a1028] ring-1 ring-white/10">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes={METRIC_THUMB}
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {product.brand}
                  </p>
                </div>

                <span className="text-lg font-semibold tabular-nums text-magenta">
                  {product.count.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-[#1a1028]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-magenta to-violet transition-all duration-700 ease-out"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
