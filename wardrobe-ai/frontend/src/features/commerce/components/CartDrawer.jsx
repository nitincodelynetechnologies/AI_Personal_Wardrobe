'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCatalogPrice } from '@/features/catalog/constants/catalogOptions';
import { useCartStore } from '@/features/commerce/store/useCartStore';

const CART_THUMB_SIZES = '80px';

export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const estimatedTotal = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeCart();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeCart]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    closeCart();
    router.push('/checkout');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          'fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-borderColor bg-background shadow-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-borderColor px-6 py-5">
          <div>
            <h2 className="font-playfair text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-borderColor p-2 text-slate-700 dark:text-gray-400 transition-colors hover:border-gray-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-slate-700 dark:text-gray-300" strokeWidth={1.25} />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Your bag is empty</p>
              <p className="max-w-xs text-sm text-slate-700 dark:text-gray-400">
                Add pieces from the catalog or virtual try-on to begin checkout.
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
                        sizes={CART_THUMB_SIZES}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-700 dark:text-gray-300">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">
                          {item.brand}
                        </p>
                        <p className="truncate font-playfair text-sm font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                          {formatCatalogPrice(item.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 inline-flex items-center border border-borderColor">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-slate-700 dark:text-gray-400 transition-colors hover:bg-gray-100"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2rem] px-2 text-center text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-slate-700 dark:text-gray-400 transition-colors hover:bg-gray-100"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-borderColor bg-white dark:bg-[#150d22] px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">
              Estimated Total
            </span>
            <span className="font-playfair text-lg font-semibold text-slate-900 dark:text-white">
              {formatCatalogPrice(estimatedTotal)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-magenta py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-magenta disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Proceed to Checkout
          </button>
        </footer>
      </aside>
    </>,
    document.body,
  );
}
