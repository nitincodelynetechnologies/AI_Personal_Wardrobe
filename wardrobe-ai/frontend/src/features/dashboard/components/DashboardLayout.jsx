'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/wardrobe', label: 'My Wardrobe', icon: Shirt },
  { href: '/dashboard', label: 'Recommendations', icon: Sparkles, disabled: true, badge: 'Soon' },
  { href: '/profile/settings', label: 'Profile', icon: Settings },
];

export function DashboardLayout({ children }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const resetProfile = useProfileStore((s) => s.resetProfile);
  const resetWardrobe = useWardrobeStore((s) => s.resetWardrobe);

  const handleLogout = () => {
    logout();
    resetProfile();
    resetWardrobe();
    window.location.href = '/login/face';
  };

  return (
    <div className="min-h-[100dvh] bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-noir-elevated/40 lg:flex lg:flex-col">
        <div className="border-b border-white/5 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Wardrobe AI</p>
          <h2 className="font-display text-lg font-semibold">Style Studio</h2>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              !item.disabled &&
              (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.label}
                href={item.disabled ? '#' : item.href}
                aria-disabled={item.disabled}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active && 'bg-champagne/15 text-champagne',
                  !active && !item.disabled && 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                  item.disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={(event) => item.disabled && event.preventDefault()}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px]">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 lg:hidden">
          <div>
            <p className="text-xs uppercase tracking-wider text-champagne">Wardrobe AI</p>
            <p className="font-display text-base font-semibold">Dashboard</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/wardrobe">Wardrobe</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile/settings">Profile</Link>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
