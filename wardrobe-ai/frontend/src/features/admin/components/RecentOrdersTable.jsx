'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_STYLES,
  formatAdminCurrency,
  formatAdminDate,
} from '@/features/admin/constants/adminMockData';

const STATUS_FALLBACK = 'border-white/10 bg-[#1a1028] text-slate-400';

export function RecentOrdersTable({
  orders,
  title = 'Recent Orders',
  embedded = false,
  showViewAll = false,
  onViewAll,
}) {
  return (
    <div
      className={
        embedded
          ? 'h-full'
          : 'admin-card overflow-hidden !p-0'
      }
    >
      <div
        className={cn(
          'flex items-start justify-between gap-4 px-6 py-5',
          !embedded && 'border-b border-white/5',
        )}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-magenta">
            Order Monitoring
          </p>
          <h3 className="mt-1 font-playfair text-2xl font-semibold text-white">{title}</h3>
        </div>

        {showViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-0.5 text-sm font-medium text-magenta transition-opacity hover:opacity-80"
          >
            View all
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div className={cn('overflow-x-auto', embedded && !showViewAll && 'mt-4')}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4 font-mono text-xs font-semibold text-magenta">
                  #{order.id}
                </td>
                <td className="px-6 py-4 font-medium text-white">{order.customer}</td>
                <td className="px-6 py-4 font-semibold tabular-nums text-white">
                  {formatAdminCurrency(order.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      ORDER_STATUS_STYLES[order.status] ?? STATUS_FALLBACK,
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{formatAdminDate(order.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
