'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ProfileMenu } from '@/components/layout/ProfileMenu';

const SEARCH_SUGGESTIONS = [
  { title: "Men's Formal Wear", type: 'Category' },
  { title: "Women's Casuals", type: 'Category' },
  { title: '3D Leather Jackets', type: '3D Asset' },
  { title: 'Summer T-Shirts', type: 'Clothing' },
  { title: "Men's Streetwear", type: 'Category' },
  { title: "Women's Evening Wear", type: 'Category' },
  { title: 'Virtual Try-On Looks', type: '3D Asset' },
  { title: 'Footwear Essentials', type: 'Clothing' },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: '3D Avatar Ready',
    message: 'Your 3D Avatar has been generated successfully!',
    time: '2m ago',
  },
  {
    id: 'notif-2',
    title: 'New Collection',
    message: 'New Summer 3D Collection just dropped.',
    time: '1h ago',
  },
  {
    id: 'notif-3',
    title: 'Style Match',
    message: 'AI found 4 new outfits matching your Fashion DNA.',
    time: 'Today',
  },
];

export function DashboardTopBar({ className }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return SEARCH_SUGGESTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showNotifications]);

  return (
    <div className={cn('mb-6 flex flex-wrap items-center gap-3', className)}>
      <div ref={searchRef} className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
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
                      onClick={() => setSearchQuery(item.title)}
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

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((open) => !open)}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-magenta dark:border-borderColor dark:bg-[#1a1025] dark:text-slate-300 dark:shadow-none',
              showNotifications && 'border-magenta/40 text-magenta',
            )}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-magenta" aria-hidden />
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/5 dark:bg-[#150d22] dark:shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-magenta">
                  Notifications
                </p>
                <span className="text-[10px] text-slate-500">{MOCK_NOTIFICATIONS.length} new</span>
              </div>
              <ul className="max-h-72 overflow-y-auto py-1">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                      onClick={() => setShowNotifications(false)}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta/15 text-magenta">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-widest text-slate-500">
                          {notification.time}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ProfileMenu />
      </div>
    </div>
  );
}
