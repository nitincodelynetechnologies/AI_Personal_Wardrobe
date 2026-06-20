'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAV_ITEMS, isNavItemActive } from '@/components/layout/nav-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-2">
        {APP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary')} />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
