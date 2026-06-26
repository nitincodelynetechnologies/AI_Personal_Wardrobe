'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BOTTOM_NAV_ITEMS,
  getNavItemActiveState,
} from '@/components/layout/nav-items';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';

function BottomNavItem({ item, active, onCartClick, onWishlistClick }) {
  const Icon = item.icon;
  const className = cn(
    'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-all duration-300',
    active
      ? 'bg-magenta text-white shadow-[0_0_16px_rgba(233,30,140,0.35)]'
      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
  );

  if (item.action === 'cart') {
    return (
      <button type="button" onClick={onCartClick} className={className} aria-label={item.label}>
        <Icon className="h-5 w-5" />
        <span>{item.shortLabel}</span>
      </button>
    );
  }

  if (item.action === 'wishlist') {
    return (
      <button type="button" onClick={onWishlistClick} className={className} aria-label={item.label}>
        <Icon className="h-5 w-5" />
        <span>{item.shortLabel}</span>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="h-5 w-5" />
      <span>{item.shortLabel}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const cartOpen = useCartStore((state) => state.isOpen);
  const wishlistOpen = useWishlistStore((state) => state.isOpen);
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
  const colCount = BOTTOM_NAV_ITEMS.length;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-borderColor bg-background/95 backdrop-blur-md dark:border-white/5 dark:bg-obsidian/95 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div
        className="mx-auto grid h-16 items-center px-2"
        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      >
        {BOTTOM_NAV_ITEMS.map((item) => (
          <BottomNavItem
            key={item.id}
            item={item}
            active={getNavItemActiveState(pathname, item, drawerState)}
            onCartClick={handleOpenCart}
            onWishlistClick={handleOpenWishlist}
          />
        ))}
      </div>
    </nav>
  );
}
