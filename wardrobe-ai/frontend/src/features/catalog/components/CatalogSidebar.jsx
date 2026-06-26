'use client';

import { cn } from '@/lib/utils';
import { CATALOG_CATEGORIES } from '@/features/catalog/constants/catalogOptions';

export function CatalogSidebar({ activeCategory, onCategoryChange }) {
  return (
    <aside className="hidden h-full w-48 shrink-0 flex-col border-r border-borderColor bg-background p-6 lg:flex">
      <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-700 dark:text-gray-400">
        Browse
      </p>
      <h2 className="mt-2 shrink-0 font-playfair text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Catalog
      </h2>

      <nav className="mt-10 space-y-1">
        {CATALOG_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                'block w-full border-l-2 py-2 pl-4 text-left text-sm transition-colors',
                isActive
                  ? 'border-magenta font-semibold text-magenta'
                  : 'border-transparent text-slate-700 dark:text-gray-400 hover:border-magenta/30 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              {category.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
