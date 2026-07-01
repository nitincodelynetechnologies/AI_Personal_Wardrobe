'use client';

import { Flame, Ticket } from 'lucide-react';
import { formatCouponDiscount } from '@/features/admin/storage/adminStorage';

export function AdminActiveCouponBanner({ coupon }) {
  if (!coupon) return null;

  const discountLabel = formatCouponDiscount(coupon);

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 text-white shadow-lg shadow-pink-500/20 sm:px-6"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
          <Ticket className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            Active Campaign
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug sm:text-base">
            <span className="font-mono tracking-wide">{coupon.code}</span> is currently live offering{' '}
            <span className="font-bold">{discountLabel}</span> off!
          </p>
        </div>
      </div>
    </div>
  );
}
