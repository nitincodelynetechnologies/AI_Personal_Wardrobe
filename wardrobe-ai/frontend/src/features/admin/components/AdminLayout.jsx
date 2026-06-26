'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ADMIN_NAV_ITEMS } from '@/features/admin/constants/adminMockData';

const NAV_ICONS = {
  overview: LayoutGrid,
  users: Users,
  catalog: BookOpen,
  orders: ShoppingBag,
  ai: Cpu,
};

export function AdminLayout({ activeSection, onSectionChange, children }) {
  const pathname = usePathname();
  const activeLabel =
    ADMIN_NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? 'Overview';

  return (
    <div className="min-h-[100dvh] bg-background text-slate-900 dark:bg-[#07030d] dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-borderColor bg-background dark:border-white/5 dark:bg-[#07030d] md:flex">
        <div className="border-b border-white/5 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/30">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h1 className="font-playfair text-base font-semibold text-slate-900 dark:text-white">Admin Console</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            const Icon = NAV_ICONS[item.id] ?? LayoutGrid;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-magenta text-white shadow-[0_0_28px_rgba(233,30,140,0.45)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-borderColor bg-background/95 px-4 py-5 backdrop-blur-md dark:border-white/5 dark:bg-[#07030d]/95 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Wardrobe AI · Enterprise
              </p>
              <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">{activeLabel}</h2>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden font-mono text-xs text-magenta/80 sm:inline">{pathname}</span>
              <ThemeToggle variant="header" />
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta text-xs font-bold text-white shadow-[0_0_20px_rgba(233,30,140,0.5)]"
                aria-label="Admin user"
              >
                AW
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto md:hidden">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.id] ?? LayoutGrid;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                    activeSection === item.id
                      ? 'border-magenta bg-magenta text-white'
                      : 'border-borderColor bg-white text-slate-600 dark:border-white/10 dark:bg-[#150d22] dark:text-slate-400',
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
