'use client';

import { Eye, Heart, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardProfileStats } from '@/features/dashboard/hooks/useDashboardProfileStats';

const PROFILE_STAT_CARDS = [
  {
    id: 'outfits-saved',
    label: 'Outfits Saved',
    key: 'outfitsSaved',
    icon: Heart,
    iconWrapperClass:
      'bg-pink-100 dark:bg-pink-500/15',
    iconClass: 'text-pink-500',
  },
  {
    id: 'try-ons-done',
    label: 'Try-Ons Done',
    key: 'tryOnsDone',
    icon: Eye,
    iconWrapperClass:
      'bg-violet-100 dark:bg-violet-500/15',
    iconClass: 'text-violet-500',
  },
  {
    id: 'wardrobe-items',
    label: 'AI Suggestions',
    key: 'wardrobeItems',
    icon: Sparkles,
    iconWrapperClass:
      'bg-amber-100 dark:bg-amber-500/15',
    iconClass: 'text-amber-500',
  },
  {
    id: 'orders-placed',
    label: 'Style Score',
    key: 'ordersPlaced',
    icon: Star,
    iconWrapperClass:
      'bg-blue-100 dark:bg-blue-500/15',
    iconClass: 'text-blue-500',
  },
];

function formatStatValue(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

export function DashboardProfileStats({ className }) {
  const stats = useDashboardProfileStats();

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 shrink-0 rounded-full bg-magenta" aria-hidden />
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-magenta">
          Your Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PROFILE_STAT_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm dark:border-white/5 dark:bg-[#150d22] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  card.iconWrapperClass,
                )}
              >
                <Icon className={cn('h-5 w-5', card.iconClass)} aria-hidden />
              </span>

              <div className="min-w-0">
                <p className="font-sans text-3xl font-bold tabular-nums leading-none text-slate-800 dark:text-white">
                  {formatStatValue(stats[card.key])}
                </p>
                <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
