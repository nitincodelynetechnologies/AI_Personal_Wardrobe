'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  LayoutGrid,
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ADMIN_NAV_ITEMS } from '@/features/admin/constants/adminMockData';
import { useAdminTicketNotifications } from '@/features/admin/hooks/useAdminTicketNotifications';

const NAV_ICONS = {
  dashboard: LayoutGrid,
  inventory: Warehouse,
  orders: ShoppingBag,
  users: UserCog,
  customers: Users,
  coupons: Tag,
};

export function AdminLayout({ activeSection, onSectionChange, onLogout, children }) {
  const pathname = usePathname();
  const { unreadCount, refresh } = useAdminTicketNotifications();
  const activeLabel =
    ADMIN_NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? 'Dashboard';

  useEffect(() => {
    const syncBadge = () => refresh();

    window.addEventListener('ticketsUpdated', syncBadge);
    return () => window.removeEventListener('ticketsUpdated', syncBadge);
  }, [refresh]);

  const renderNavBadge = (itemId) => {
    if (itemId !== 'customers' || unreadCount <= 0) return null;

    return (
      <span className="relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    );
  };

  return (
    <div className="midnight-shell min-h-[100dvh] bg-transparent text-slate-900 print:hidden dark:text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-borderColor bg-background/95 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/50 md:flex">
        <div className="border-b border-borderColor px-5 py-5 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/30">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h1 className="font-playfair text-base font-semibold text-slate-900 dark:text-slate-100">
                Admin Portal
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">E-Commerce & AI</p>
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
                  'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-magenta text-white shadow-[0_0_28px_rgba(233,30,140,0.35)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1 text-left">{item.label}</span>
                {renderNavBadge(item.id)}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-borderColor p-3 dark:border-slate-700/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-borderColor bg-background/80 px-4 py-4 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/70 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Wardrobe AI · Enterprise
              </p>
              <h2 className="font-playfair text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">
                {activeLabel}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-xs text-magenta/80 sm:inline">{pathname}</span>
              <ThemeToggle variant="header" />
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta text-xs font-bold text-white shadow-[0_0_20px_rgba(233,30,140,0.4)]"
                aria-label="Admin user"
              >
                AD
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto md:hidden">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.id] ?? Package;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                    activeSection === item.id
                      ? 'border-magenta bg-magenta text-white'
                      : 'border-borderColor bg-white text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-300',
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  <span>{item.label}</span>
                  {item.id === 'customers' && unreadCount > 0 && (
                    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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
