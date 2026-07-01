'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { SupportNotificationBell } from '@/features/support/components/SupportNotificationBell';
import { buildCatalogSearchPath } from '@/features/catalog/services/catalogService';

const SEARCH_SUGGESTIONS = [
  { title: "Men's Formal Wear", type: 'Category', query: 'men' },
  { title: "Women's Casuals", type: 'Category', query: 'women' },
  { title: '3D Leather Jackets', type: '3D Asset', query: 'jacket' },
  { title: 'Summer T-Shirts', type: 'Clothing', query: 'shirt' },
  { title: "Men's Streetwear", type: 'Category', query: 'men streetwear' },
  { title: "Women's Evening Wear", type: 'Category', query: 'women evening' },
  { title: 'Virtual Try-On Looks', type: '3D Asset', query: '3d' },
  { title: 'Footwear Essentials', type: 'Clothing', query: 'footwear' },
];

export function DashboardTopBar({ className }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const runCatalogSearch = useCallback(
    (term = searchQuery) => {
      router.push(buildCatalogSearchPath(term));
    },
    [router, searchQuery],
  );

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return SEARCH_SUGGESTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.query.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runCatalogSearch();
      }
    },
    [runCatalogSearch],
  );

  return (
    <div className={cn('mb-6 flex flex-wrap items-center gap-3', className)}>
      <div ref={searchRef} className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => runCatalogSearch()}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors hover:text-magenta"
          aria-label="Search catalog"
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search styles, pieces, brands..."
          className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-magenta/40 focus:outline-none focus:ring-2 focus:ring-magenta/20 dark:border-borderColor dark:bg-[#1a1025] dark:text-white dark:shadow-none dark:placeholder:text-slate-400"
          aria-autocomplete="list"
          aria-expanded={searchQuery.length > 0}
        />

        {searchQuery.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/5 dark:bg-[#150d22] dark:shadow-2xl">
            {filteredSuggestions.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto py-1">
                {filteredSuggestions.map((item) => (
                  <li key={item.title}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                      onClick={() => runCatalogSearch(item.query)}
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {item.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-slate-400">
                No results found for &apos;{searchQuery}&apos;
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle variant="header" />
        <SupportNotificationBell />
        <ProfileMenu />
      </div>
    </div>
  );
}
