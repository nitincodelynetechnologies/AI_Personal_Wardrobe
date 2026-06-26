'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';

function CommerceBadge({ count }) {
  if (!count) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white dark:bg-[#150d22] px-1 text-[10px] font-bold tabular-nums text-slate-900 dark:text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export function CommerceNavActions({ className, iconClassName }) {
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);
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

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={handleOpenWishlist}
        className="relative rounded-full p-2 text-slate-700 dark:text-gray-400 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        aria-label={`Wishlist, ${wishlistCount} items`}
      >
        <Heart className={cn('h-4 w-4', iconClassName)} />
        <CommerceBadge count={wishlistCount} />
      </button>

      <button
        type="button"
        onClick={handleOpenCart}
        className="relative rounded-full p-2 text-slate-700 dark:text-gray-400 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        aria-label={`Shopping bag, ${cartCount} items`}
      >
        <ShoppingBag className={cn('h-4 w-4', iconClassName)} />
        <CommerceBadge count={cartCount} />
      </button>
    </div>
  );
}
