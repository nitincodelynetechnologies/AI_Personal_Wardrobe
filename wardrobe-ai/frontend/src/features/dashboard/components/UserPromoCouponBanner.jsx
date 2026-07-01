'use client';

import { Flame, Gift } from 'lucide-react';
import { formatCouponDiscount } from '@/features/admin/storage/adminStorage';

export function UserPromoCouponBanner({ coupon }) {
  if (!coupon) return null;

  const discountLabel = formatCouponDiscount(coupon);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-4 py-4 text-white shadow-xl shadow-pink-500/25 sm:px-6 sm:py-5"
      role="region"
      aria-label="Active promotional offer"
    >
      <div
        className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-white/0 via-white/10 to-white/0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-orange-400/20 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Gift className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 sm:tracking-[0.25em]">
              <Flame className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Limited Time
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug sm:text-base">
              <span aria-hidden>🎉 </span>
              SPECIAL OFFER: Get <span className="font-bold">{discountLabel}</span> OFF on your style
              transformation!
            </p>
            {coupon.description ? (
              <p className="mt-1 text-xs text-white/80">{coupon.description}</p>
            ) : null}
            <p className="mt-2 text-[11px] font-medium text-white/75 sm:text-xs">
              Use this code at checkout
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 sm:items-end">
          <span
            className="inline-flex items-center justify-center rounded-lg border-2 border-dashed border-white/60 bg-white/20 px-4 py-2 font-mono text-sm font-bold tracking-[0.2em] text-white sm:text-base"
            title="Copy and apply at checkout"
          >
            {coupon.code}
          </span>
        </div>
      </div>
    </div>
  );
}
