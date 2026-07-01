'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/layout/BottomNav';
import {
  APP_NAV_ITEMS,
  getNavItemActiveState,
  isNavItemActive,
  SIDEBAR_NAV_ITEMS,
} from '@/components/layout/nav-items';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { CartDrawer } from '@/features/commerce/components/CartDrawer';
import { CommerceNavActions } from '@/features/commerce/components/CommerceNavActions';
import { WishlistDrawer } from '@/features/commerce/components/WishlistDrawer';
import { StylistChatbot } from '@/features/stylist-chat/components/StylistChatbot';
import { SupportHelpFab } from '@/features/support/components/SupportHelpFab';
import { SupportChatWidget } from '@/features/support/components/SupportChatWidget';
import { SupportNotificationBell } from '@/features/support/components/SupportNotificationBell';
import { SupportNotificationToast } from '@/features/support/components/SupportNotificationToast';
import { OrderHistoryModal } from '@/features/orders/components/OrderHistoryModal';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { useIsAdmin } from '@/features/auth/hooks/useIsAdmin';
import { MemberRouteGuard } from '@/features/auth/components/MemberRouteGuard';

function getMobileTitle(pathname) {
  const match = APP_NAV_ITEMS.find((item) => item.href && isNavItemActive(pathname, item));
  return match?.label ?? 'Wardrobe AI';
}

function SidebarLabel({ isCollapsed, children, className }) {
  return (
    <span
      className={cn(
        'whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-0',
        className,
      )}
    >
      {children}
    </span>
  );
}

function NavCountBadge({ count, tone = 'orange', isCollapsed }) {
  if (!count) return null;

  if (isCollapsed) {
    return (
      <span
        className={cn(
          'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full',
          tone === 'rose' && 'bg-rose-500',
          tone === 'orange' && 'bg-orange-500',
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        'ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums transition-opacity duration-300',
        tone === 'rose' && 'bg-rose-500/15 text-rose-500 dark:text-rose-400',
        tone === 'orange' && 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

function SidebarNavItem({
  item,
  active,
  isCollapsed,
  onWishlistClick,
  onCartClick,
  cartCount,
  wishlistCount,
}) {
  const Icon = item.icon;
  const sharedClass = cn(
    'flex w-full items-center rounded-xl py-2.5 text-base font-medium tracking-wide transition-all duration-300 ease-in-out',
    isCollapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3',
    active
      ? 'bg-magenta text-white shadow-[0_0_20px_rgba(233,30,140,0.35)]'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-[#1a1028] hover:text-slate-900 dark:hover:text-white',
  );

  const content = (
    <>
      <span className="relative shrink-0">
        <Icon
          className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')}
          aria-hidden
        />
        {isCollapsed && item.action === 'cart' && (
          <NavCountBadge count={cartCount} tone="orange" isCollapsed />
        )}
        {isCollapsed && item.action === 'wishlist' && (
          <NavCountBadge count={wishlistCount} tone="rose" isCollapsed />
        )}
      </span>
      <SidebarLabel isCollapsed={isCollapsed} className="flex-1 text-left">
        {item.label}
      </SidebarLabel>
      {!isCollapsed && item.action === 'cart' && (
        <NavCountBadge count={cartCount} tone="orange" isCollapsed={false} />
      )}
      {!isCollapsed && item.action === 'wishlist' && (
        <NavCountBadge count={wishlistCount} tone="rose" isCollapsed={false} />
      )}
    </>
  );

  const title = isCollapsed ? item.label : undefined;

  if (item.action === 'wishlist') {
    return (
      <button type="button" onClick={onWishlistClick} className={sharedClass} title={title}>
        {content}
      </button>
    );
  }

  if (item.action === 'cart') {
    return (
      <button type="button" onClick={onCartClick} className={sharedClass} title={title}>
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={sharedClass} title={title}>
        {content}
      </Link>
    );
  }

  return null;
}

export function AppLayout({ children }) {
  const pathname = usePathname();
  const isCatalog = pathname.startsWith('/catalog');
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const cartOpen = useCartStore((state) => state.isOpen);
  const wishlistOpen = useWishlistStore((state) => state.isOpen);
  const isAdmin = useIsAdmin();
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);

  const handleOpenCart = () => {
    closeWishlist();
    openCart();
  };

  const handleOpenWishlist = () => {
    closeCart();
    openWishlist();
  };

  const drawerState = { cartOpen, wishlistOpen };

  return (
    <MemberRouteGuard>
    <div className="midnight-shell flex h-screen w-full overflow-hidden bg-background text-slate-900 dark:text-slate-200">
      <aside
        className={cn(
          'relative z-40 hidden h-full shrink-0 flex-col border-r border-borderColor bg-background transition-all duration-300 ease-in-out dark:border-slate-700/50 dark:bg-slate-900/50 dark:backdrop-blur-xl md:flex',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div
          className={cn(
            'shrink-0 border-b border-borderColor py-4 transition-all duration-300 ease-in-out',
            isCollapsed ? 'px-3' : 'px-4',
          )}
        >
          <div
            className={cn(
              'flex items-center transition-all duration-300 ease-in-out',
              isCollapsed ? 'justify-center' : 'gap-3',
            )}
          >
            <Link
              href="/dashboard"
              title="Style Studio — AI Wardrobe"
              className={cn(
                'flex min-w-0 items-center rounded-xl transition-opacity duration-300 hover:opacity-90',
                isCollapsed ? 'justify-center' : 'flex-1 gap-3',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/25">
                <Sparkles className="h-4 w-4" aria-hidden />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
                    Style Studio
                  </p>
                  <h2 className="whitespace-nowrap font-playfair text-base font-semibold text-slate-900 dark:text-slate-100">
                    AI Wardrobe
                  </h2>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed((value) => !value)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-borderColor text-slate-600 transition-colors duration-300 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1a1028] dark:hover:text-white"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed((value) => !value)}
                className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-borderColor bg-background text-slate-600 shadow-sm dark:text-slate-400"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <nav
          className={cn(
            'flex-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide transition-all duration-300 ease-in-out',
            isCollapsed ? 'p-2' : 'p-4',
          )}
        >
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              active={getNavItemActiveState(pathname, item, drawerState)}
              onWishlistClick={handleOpenWishlist}
              onCartClick={handleOpenCart}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
            />
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              title={isCollapsed ? 'Admin Console' : undefined}
              className={cn(
                'flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
                isCollapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3',
                pathname.startsWith('/admin')
                  ? 'bg-magenta text-white shadow-[0_0_20px_rgba(233,30,140,0.35)]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-[#1a1028] hover:text-slate-900 dark:hover:text-white',
              )}
            >
              <Shield className="h-4 w-4 shrink-0" />
              <SidebarLabel isCollapsed={isCollapsed}>Admin Console</SidebarLabel>
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-40 flex shrink-0 items-center justify-between border-b border-borderColor bg-background/90 px-4 py-3 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70 md:hidden">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-magenta">Wardrobe AI</p>
            <p className="truncate font-playfair text-base font-semibold text-slate-900 dark:text-slate-100">
              {getMobileTitle(pathname)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <CommerceNavActions />
            <ThemeToggle variant="header" />
            <SupportNotificationBell />
            <ProfileMenu />
          </div>
        </header>

        <main
          className={cn(
            'app-main min-h-0 flex-1 overflow-x-hidden bg-transparent text-slate-900 dark:text-slate-200',
            isCatalog
              ? 'flex flex-col overflow-hidden p-0'
              : 'scrollbar-hide overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8',
          )}
        >
          {!isDashboard && (
            <div className="mb-4 hidden items-center justify-end gap-2 md:flex">
              <ThemeToggle variant="header" />
              <SupportNotificationBell />
              <ProfileMenu />
            </div>
          )}
          {children}
        </main>
      </div>

      <BottomNav />
      <CartDrawer />
      <WishlistDrawer />
      <StylistChatbot />
      <SupportHelpFab />
      <SupportChatWidget />
      <OrderHistoryModal />
      <SupportNotificationToast />
    </div>
    </MemberRouteGuard>
  );
}
