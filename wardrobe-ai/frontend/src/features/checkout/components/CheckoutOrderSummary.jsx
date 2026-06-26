'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { formatCatalogPrice } from '@/features/catalog/constants/catalogOptions';

const SUMMARY_THUMB = '72px';

export function CheckoutOrderSummary({ items, className }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 0 : 0;

  return (
    <div className={className}>
      <div className="border border-borderColor bg-white dark:bg-[#150d22] p-6 shadow-sm lg:sticky lg:top-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-700 dark:text-gray-400">
          Order Summary
        </p>
        <h2 className="mt-2 font-playfair text-xl font-semibold text-slate-900 dark:text-white">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </h2>

        <ul className="mt-6 max-h-[min(50vh,24rem)] space-y-4 overflow-y-auto border-t border-borderColor pt-6">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-gray-100">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes={SUMMARY_THUMB}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-700 dark:text-gray-300">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">
                  {item.brand}
                </p>
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="mt-1 text-xs text-slate-700 dark:text-gray-400">Qty {item.quantity}</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {formatCatalogPrice(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3 border-t border-borderColor pt-6 text-sm">
          <div className="flex justify-between text-slate-700 dark:text-gray-400">
            <span>Subtotal</span>
            <span>{formatCatalogPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-gray-400">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Complimentary' : formatCatalogPrice(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-borderColor pt-3 font-playfair text-lg font-semibold text-slate-900 dark:text-white">
            <span>Total</span>
            <span>{formatCatalogPrice(subtotal + shipping)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
