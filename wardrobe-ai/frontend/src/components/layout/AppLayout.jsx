'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { APP_NAV_ITEMS, isNavItemActive } from '@/components/layout/nav-items';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';

function getMobileTitle(pathname) {
  const match = APP_NAV_ITEMS.find((item) => isNavItemActive(pathname, item));
  return match?.label ?? 'Wardrobe AI';
}

export function AppLayout({ children }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const resetProfile = useProfileStore((state) => state.resetProfile);
  const resetWardrobe = useWardrobeStore((state) => state.resetWardrobe);
  const resetOutfits = useOutfitStore((state) => state.resetOutfits);

  const handleLogout = () => {
    logout();
    resetProfile();
    resetWardrobe();
    resetOutfits();
    window.location.href = '/login/face';
  };

  return (
    <div className="min-h-[100dvh] bg-background md:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Wardrobe AI</p>
          <h2 className="font-display text-lg font-semibold text-foreground">Style Studio</h2>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active && 'bg-primary/15 text-primary',
                  !active && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <ThemeToggle showLabel className="w-full" />
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-primary">Wardrobe AI</p>
            <p className="truncate font-display text-base font-semibold">{getMobileTitle(pathname)}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="app-main flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
