'use client';

import { cn } from '@/lib/utils';
import { WARDROBE_FILTERS } from '@/features/wardrobe/constants/wardrobeOptions';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';

export function WardrobeFilters() {
  const categoryFilter = useWardrobeStore((state) => state.categoryFilter);
  const setCategoryFilter = useWardrobeStore((state) => state.setCategoryFilter);

  return (
    <div className="flex flex-wrap gap-2">
      {WARDROBE_FILTERS.map((filter) => {
        const active = categoryFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => setCategoryFilter(filter.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              active
                ? 'bg-violet text-white font-medium'
                : 'border border-borderColor bg-white/5 dark:bg-[#150d22]/50 text-muted-foreground hover:border-violet/30 hover:text-foreground',
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
