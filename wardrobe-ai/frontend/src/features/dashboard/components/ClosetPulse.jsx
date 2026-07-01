'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Loader2, Plus, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatLabel } from '@/features/dashboard/utils/dashboardUtils';

const WARDROBE_THUMB_SIZES = '96px';

export function ClosetPulse({ items = [], isLoading = false, className }) {
  const recentItems = items.slice(0, 3);

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#150d22] dark:shadow-[0_0_30px_rgba(233,30,140,0.06)] sm:p-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">
            Closet Pulse
          </p>
          <h2 className="mt-1 font-playfair text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
            Last Added to Wardrobe
          </h2>
        </div>
        <Link
          href="/wardrobe"
          className="inline-flex items-center gap-1 text-sm font-semibold text-magenta transition-opacity hover:opacity-80"
        >
          View wardrobe
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && recentItems.length === 0 ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-magenta" />
          Syncing your closet...
        </div>
      ) : recentItems.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center dark:border-white/10 dark:bg-slate-950/40">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-magenta/10 text-magenta ring-1 ring-magenta/20">
            <Shirt className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Your wardrobe is waiting</p>
          <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-400">
            Upload your first piece to see recent additions here.
          </p>
          <Link
            href="/wardrobe"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-magenta px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-magenta/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href="/wardrobe"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-all hover:border-magenta/25 hover:bg-white dark:border-white/5 dark:bg-slate-950/50 dark:hover:border-magenta/20 dark:hover:bg-[#1a1028]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.sub_category || item.category || 'Wardrobe item'}
                    fill
                    sizes={WARDROBE_THUMB_SIZES}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Shirt className="h-5 w-5" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {item.sub_category || formatLabel(item.category) || 'Wardrobe item'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {formatLabel(item.category)}
                  {item.season ? ` · ${item.season}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
