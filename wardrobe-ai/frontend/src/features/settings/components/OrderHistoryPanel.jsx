'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, Package, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OrderInvoiceModal } from '@/features/admin/components/OrderInvoiceModal';
import {
  formatAdminCurrency,
  formatAdminDate,
  ORDER_STATUS_STYLES,
} from '@/features/admin/constants/adminMockData';
import { useUserOrders } from '@/features/orders/hooks/useUserOrders';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const BILL_ELIGIBLE_STATUSES = new Set(['Delivered', 'Confirmed']);

function getOrderLineItems(order) {
  if (Array.isArray(order.items) && typeof order.items[0] === 'object') {
    return order.items;
  }

  if (Array.isArray(order.lineItems) && order.lineItems.length > 0) {
    return order.lineItems.map((item) => ({
      name: item.name,
      image_url: item.image_url ?? null,
    }));
  }

  return (order.products ?? []).map((name) => ({ name, image_url: null }));
}

function OrderItemThumbnails({ items }) {
  const preview = items.slice(0, 3);
  const overflow = items.length - preview.length;

  return (
    <div className="flex items-center gap-2">
      {preview.map((item, index) => (
        <div
          key={`${item.id ?? item.name}-${index}`}
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-borderColor bg-slate-100 dark:border-white/10 dark:bg-black/30"
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <Package className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <span className="text-xs font-semibold text-slate-500">+{overflow}</span>
      )}
    </div>
  );
}

export function OrderHistoryPanel({ markReadOnMount = false }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userEmail = useAuthStore((state) => state.user?.email);
  const { orders, loading, error, markAllRead } = useUserOrders({
    enabled: isAuthenticated,
    poll: true,
  });
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    if (!markReadOnMount || orders.length === 0) return;
    markAllRead();
  }, [markReadOnMount, markAllRead, orders.length]);

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to view your order history.
      </p>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-magenta" />
        Loading your orders…
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-muted-foreground">
          No orders yet{userEmail ? ` for ${userEmail}` : ''}.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => {
          const lineItems = getOrderLineItems(order);
          const itemNames =
            order.products?.length > 0
              ? order.products
              : lineItems.map((item) => item.name).filter(Boolean);
          const showBill = BILL_ELIGIBLE_STATUSES.has(order.status);

          return (
            <article
              key={order.id}
              className={cn(
                'overflow-hidden rounded-2xl border border-borderColor bg-gradient-to-br from-white to-slate-50/80 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:from-[#0f0818] dark:to-[#150d22]/80',
                order.userUnreadUpdate && 'ring-2 ring-magenta/30',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-borderColor/60 px-4 py-4 dark:border-white/5">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-magenta">{order.id}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Placed {formatAdminDate(order.date ?? order.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                    ORDER_STATUS_STYLES[order.status] ?? 'border-white/10 text-slate-400',
                  )}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 px-4 py-4">
                <OrderItemThumbnails items={lineItems} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatAdminCurrency(order.amount)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {itemNames.join(' · ')}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                    {typeof order.items === 'number' ? order.items : lineItems.length} item
                    {(typeof order.items === 'number' ? order.items : lineItems.length) === 1
                      ? ''
                      : 's'}
                  </p>
                </div>
              </div>

              {showBill && (
                <div className="border-t border-borderColor/60 px-4 py-3 dark:border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-magenta/30 text-magenta hover:bg-magenta/10"
                    onClick={() => setInvoiceOrder(order)}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Download Bill
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <FileText className="h-3.5 w-3.5" />
        Order status updates from our team sync automatically.
      </p>

      <OrderInvoiceModal
        order={invoiceOrder}
        open={Boolean(invoiceOrder)}
        onClose={() => setInvoiceOrder(null)}
      />
    </>
  );
}
