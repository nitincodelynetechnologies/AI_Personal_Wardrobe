'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import { formatCatalogPrice } from '@/features/catalog/constants/catalogOptions';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';

const WISHLIST_THUMB_SIZES = '80px';

export function WishlistDrawer() {
  const showToast = useToastStore((state) => state.showToast);
  const isOpen = useWishlistStore((state) => state.isOpen);
  const items = useWishlistStore((state) => state.items);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeWishlist();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeWishlist]);

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
    closeWishlist();
    showToast({ message: `${item.name} moved to your bag.`, variant: 'success' });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeWishlist}
        aria-hidden={!isOpen}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        className={cn(
          'fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-borderColor bg-background shadow-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-borderColor px-6 py-5">
          <div>
            <h2 className="font-playfair text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Wishlist
            </h2>
          </div>
          <button
            type="button"
            onClick={closeWishlist}
            className="rounded-full border border-borderColor p-2 text-slate-700 dark:text-gray-400 transition-colors hover:border-gray-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close wishlist"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <Heart className="h-10 w-10 text-slate-700 dark:text-gray-300" strokeWidth={1.25} />
              <p className="text-sm font-medium text-slate-900 dark:text-white">No saved pieces yet</p>
              <p className="max-w-xs text-sm text-slate-700 dark:text-gray-400">
                Tap the heart on any catalog item to build your wishlist.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-borderColor pb-5 last:border-b-0"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-gray-100">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes={WISHLIST_THUMB_SIZES}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-700 dark:text-gray-300">
                        <Heart className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">
                      {item.brand}
                    </p>
                    <p className="truncate font-playfair text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {formatCatalogPrice(item.price)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        className="inline-flex items-center gap-1.5 border border-magenta bg-magenta px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-magenta"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Add to Bag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
}
