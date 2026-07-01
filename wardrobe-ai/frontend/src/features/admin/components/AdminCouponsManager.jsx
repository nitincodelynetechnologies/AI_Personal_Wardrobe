'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ADMIN_COUPONS_UPDATED,
  readCoupons,
  toggleCouponStatus,
  writeCoupons,
} from '@/features/admin/storage/adminStorage';

export function AdminCouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState('percent');

  const refresh = useCallback(() => {
    setCoupons(readCoupons());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(ADMIN_COUPONS_UPDATED, refresh);
    return () => window.removeEventListener(ADMIN_COUPONS_UPDATED, refresh);
  }, [refresh]);

  const handleCreate = (event) => {
    event.preventDefault();
    if (!code.trim() || !discount) return;

    const next = [
      ...coupons,
      {
        id: Date.now(),
        code: code.trim().toUpperCase(),
        discount: Number(discount),
        type,
        status: 'inactive',
        uses: 0,
      },
    ];
    writeCoupons(next);
    setCode('');
    setDiscount('');
    refresh();
  };

  const toggleCoupon = (id) => {
    toggleCouponStatus(id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">Promotions</p>
        <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">
          Coupon & Discount Manager
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Saved to <code className="text-pink-400">vton_coupons</code> in localStorage.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-2xl border border-borderColor bg-white/60 p-6 backdrop-blur-md dark:border-white/10 dark:bg-[#150d22]/80 md:grid-cols-4"
      >
        <div className="space-y-2 md:col-span-1">
          <Label>Code</Label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="AI30OFF"
            className="uppercase dark:bg-[#0f0818]"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Discount</Label>
          <Input
            type="number"
            min="1"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            placeholder="30"
            className="dark:bg-[#0f0818]"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="flex h-11 w-full rounded-xl border border-borderColor bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0f0818] dark:text-white"
          >
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full rounded-full bg-magenta font-bold uppercase tracking-wider">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => {
          const isActive = coupon.status === 'active';

          return (
          <article
            key={coupon.id}
            className={cn(
              'rounded-2xl border p-5 shadow-lg backdrop-blur-md transition-all',
              isActive
                ? 'border-magenta/30 bg-magenta/5 dark:bg-magenta/10'
                : 'border-borderColor bg-white/40 opacity-75 dark:border-white/10 dark:bg-[#150d22]/60',
            )}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-magenta" />
                <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                  {coupon.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleCoupon(coupon.id)}
                className="text-magenta"
                aria-label={isActive ? 'Deactivate coupon' : 'Activate coupon'}
              >
                {isActive ? (
                  <ToggleRight className="h-7 w-7" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-500" />
                )}
              </button>
            </div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {coupon.type === 'percent' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {isActive ? 'Active' : 'Inactive'} · {coupon.uses} uses
            </p>
          </article>
          );
        })}
      </div>
    </div>
  );
}
