'use client';

import Link from 'next/link';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCatalogPrice } from '@/features/catalog/constants/catalogOptions';
import {
  ORDER_STATUSES,
  formatOrderDisplayId,
} from '@/features/checkout/constants/checkoutOptions';

export function OrderSuccess({ order }) {
  if (!order) return null;

  const activeIndex = ORDER_STATUSES.findIndex((step) => step.key === 'confirmed');

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 animate-success-scale items-center justify-center rounded-full bg-magenta text-white shadow-lg">
          <Check className="h-10 w-10 stroke-[2.5]" />
        </div>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-700 dark:text-gray-400">
          Order Confirmed
        </p>
        <h1 className="mt-3 font-playfair text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Thank you for your order
        </h1>
        <p className="mt-3 text-sm text-slate-700 dark:text-gray-400">
          Your payment was processed successfully. A confirmation has been saved to your account.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 border border-borderColor bg-white dark:bg-[#150d22] px-5 py-3 shadow-sm">
          <Package className="h-4 w-4 text-magenta" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">
            Order ID
          </span>
          <span className="font-playfair text-base font-semibold text-slate-900 dark:text-white">
            {formatOrderDisplayId(order.id)}
          </span>
        </div>

        <div className="mt-10 rounded-none border border-borderColor bg-white dark:bg-[#150d22] p-6 text-left shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400">
            Order Lifecycle
          </p>
          <div className="mt-5 space-y-4">
            {ORDER_STATUSES.map((step, index) => {
              const completed = index <= activeIndex;
              const isCurrent = step.key === order.status.toLowerCase();

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                      completed
                        ? 'border-magenta bg-magenta text-white'
                        : 'border-borderColor bg-white dark:bg-[#150d22] text-slate-700 dark:text-gray-400',
                    )}
                  >
                    {completed ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        completed ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-400',
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-[#9A7B3C]">Current status · {order.status}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between border-t border-borderColor pt-4 text-sm">
            <span className="text-slate-700 dark:text-gray-400">Amount paid</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCatalogPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/closet"
            className="inline-flex items-center justify-center gap-2 bg-magenta px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-magenta"
          >
            <Package className="h-4 w-4" />
            View Personal Closet
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white dark:bg-[#150d22] px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-900 dark:text-white transition-colors hover:border-magenta"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
