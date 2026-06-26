'use client';

import Image from 'next/image';
import { Eye } from 'lucide-react';
import { TRENDING_LOOKS } from '@/features/dashboard/constants/dashboardStyleLooks';

export function TrendingThisWeek({ onTryOn }) {
  return (
    <section className="space-y-5 pb-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">
          Platform Pulse
        </p>
        <h2 className="mt-1 font-playfair text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
          Trending This Week
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TRENDING_LOOKS.map((look) => (
          <article
            key={look.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#150d22] dark:shadow-none"
          >
            <div className="relative aspect-[4/5] min-h-[220px]">
              <Image
                src={look.image_url}
                alt={look.styleName}
                fill
                sizes="(max-width: 768px) 50vw, 280px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />

              <span className="absolute left-3 top-3 rounded-full bg-obsidian/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                {look.category}
              </span>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <p className="font-playfair text-base font-semibold text-white">{look.styleName}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-magenta">
                    {look.matchScore}% match
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTryOn?.(look)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta text-white shadow-[0_0_16px_rgba(233,30,140,0.45)]"
                  aria-label={`Preview ${look.styleName}`}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
