'use client';

import { useMemo, useState } from 'react';
import { FileText, Package, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAdminCurrency, ORDER_STATUS_STYLES } from '@/features/admin/constants/adminMockData';
import { OrderInvoiceModal } from '@/features/admin/components/OrderInvoiceModal';
import { ORDER_PIPELINE } from '@/features/admin/storage/adminCrmStorage';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { updateAdminOrderStatus } from '@/features/admin/services/adminService';
import { updateOrderStatus } from '@/features/admin/storage/adminStorage';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

function OrderCard({ order, onStatusChange, onGenerateBill }) {
  return (
    <article className="rounded-xl border border-borderColor bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0f0818]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-magenta">{order.id}</span>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
            ORDER_STATUS_STYLES[order.status] ?? 'border-white/10 text-slate-400',
          )}
        >
          {order.status}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.customer}</p>
      <p className="text-xs text-slate-500">{formatAdminCurrency(order.amount)} · {order.items} items</p>
      <select
        value={order.status}
        onChange={(event) => onStatusChange(order.id, event.target.value)}
        className="mt-3 w-full rounded-lg border border-borderColor bg-white px-2 py-1.5 text-xs dark:border-white/10 dark:bg-[#150d22] dark:text-white"
      >
        {ORDER_PIPELINE.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onGenerateBill(order)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-magenta/30 bg-magenta/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-magenta transition-colors hover:bg-magenta/20"
      >
        <Printer className="h-3 w-3" />
        Generate Bill
      </button>
    </article>
  );
}

export function AdminOrdersManager() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { orders, refresh, dataSource } = useAdminOrders();
  const [view, setView] = useState('kanban');
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const grouped = useMemo(() => {
    return ORDER_PIPELINE.reduce((acc, status) => {
      acc[status] = orders.filter((order) => order.status === status);
      return acc;
    }, {});
  }, [orders]);

  const handleStatusChange = async (orderId, status) => {
    if (accessToken) {
      try {
        await updateAdminOrderStatus(orderId, status, accessToken);
      } catch {
        updateOrderStatus(orderId, status);
      }
    } else {
      updateOrderStatus(orderId, status);
    }
    refresh();
  };

  const handleGenerateBill = (order) => {
    setInvoiceOrder(order);
  };

  const handleCloseInvoice = () => {
    setInvoiceOrder(null);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6 print:hidden">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">Fulfillment</p>
            <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">
              Order & Shipping Tracking
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Pipeline: Pending → Processing → Shipped → Delivered · Cancelled
              {dataSource === 'api' ? ' · Live from database' : ' · Local cache'}
            </p>
          </div>
          <div className="flex rounded-full border border-borderColor p-1 dark:border-white/10">
            {['kanban', 'table'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                  view === mode
                    ? 'bg-magenta text-white'
                    : 'text-slate-600 dark:text-slate-400',
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {view === 'kanban' ? (
          <div className="grid gap-4 overflow-x-auto lg:grid-cols-5">
            {ORDER_PIPELINE.map((status) => (
              <div
                key={status}
                className="min-w-[220px] rounded-2xl border border-borderColor bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-[#150d22]/60"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    {status}
                  </h3>
                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold dark:bg-white/10">
                    {grouped[status]?.length ?? 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {(grouped[status] ?? []).map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onGenerateBill={handleGenerateBill}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-borderColor bg-white/60 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#150d22]/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-borderColor bg-slate-50/80 dark:border-white/5 dark:bg-black/20">
                    {['Order ID', 'Customer', 'Amount', 'Status', 'Actions'].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-borderColor/60 dark:border-white/5"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-magenta">{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">{order.customer}</p>
                        <p className="text-xs text-slate-500">{order.email}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold">{formatAdminCurrency(order.amount)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          className="rounded-lg border border-borderColor bg-white px-3 py-1.5 text-xs dark:border-white/10 dark:bg-[#0f0818] dark:text-white"
                        >
                          {ORDER_PIPELINE.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleGenerateBill(order)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-magenta/30 bg-magenta/10 px-3 py-1.5 text-xs font-semibold text-magenta transition-colors hover:bg-magenta/20"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Print Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-500">
            <Package className="h-8 w-8 opacity-40" />
            <p className="text-sm">No orders yet.</p>
          </div>
        )}
      </div>

      <OrderInvoiceModal
        order={invoiceOrder}
        open={Boolean(invoiceOrder)}
        onClose={handleCloseInvoice}
      />
    </>
  );
}
