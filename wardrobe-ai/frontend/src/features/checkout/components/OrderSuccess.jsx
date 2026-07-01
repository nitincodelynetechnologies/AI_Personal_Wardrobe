'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { Check, FileText, Package, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCatalogPrice } from '@/features/catalog/constants/catalogOptions';
import {
  ORDER_STATUSES,
  formatOrderDisplayId,
} from '@/features/checkout/constants/checkoutOptions';

const INVOICE_TAX_RATE = 0.05;

const INVOICE_COMPANY = {
  name: 'Wardrobe AI Pvt. Ltd.',
  tagline: 'AI Virtual Fashion Platform',
  address: '42 Fashion District, Bandra Kurla Complex',
  city: 'Mumbai, Maharashtra 400051, India',
  email: 'billing@wardrobeai.com',
  gstin: '27AABCU9603R1ZX',
};

function formatInvoiceDate(order) {
  const raw = order.createdAt ?? order.date;
  if (!raw) return new Date().toLocaleDateString('en-IN');
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
}

function buildLineItems(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.map((item) => ({
    name: item.name ?? 'Item',
    variant: item.brand || 'Standard',
    qty: Math.max(1, Number(item.quantity) || 1),
    price: Number(item.price) || 0,
  }));
}

function computeTotals(order) {
  const lineItems = buildLineItems(order);
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * INVOICE_TAX_RATE);
  const grandTotal = order.total ?? subtotal + tax;

  return { lineItems, subtotal, tax, grandTotal };
}

function OrderConfirmationInvoice({ order }) {
  const { lineItems, subtotal, tax, grandTotal } = computeTotals(order);
  const taxPercent = Math.round(INVOICE_TAX_RATE * 100);

  return (
    <article
      data-order-invoice-print
      className="hidden bg-white text-black print:block print:fixed print:inset-0 print:z-[99999] print:overflow-visible print:bg-white print:p-[14mm] print:text-black"
    >
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <p className="text-lg font-bold text-slate-900">{INVOICE_COMPANY.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{INVOICE_COMPANY.tagline}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {INVOICE_COMPANY.address}
            <br />
            {INVOICE_COMPANY.city}
            <br />
            {INVOICE_COMPANY.email}
          </p>
        </div>
        <div className="text-right">
          <h1 className="font-playfair text-4xl font-bold text-slate-900">INVOICE</h1>
          <p className="mt-1 text-xs text-slate-500">GSTIN: {INVOICE_COMPANY.gstin}</p>
        </div>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Bill To</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {order.shipping?.fullName ?? 'Customer'}
          </p>
          <p className="text-sm text-slate-600">{order.shipping?.email ?? '—'}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {order.shipping?.address}
            {order.shipping?.city ? `, ${order.shipping.city}` : ''}
            {order.shipping?.pincode ? ` — ${order.shipping.pincode}` : ''}
          </p>
        </div>

        <div className="space-y-2 text-sm sm:text-right">
          <div className="flex justify-between gap-4 sm:block">
            <span className="text-slate-500">Order ID</span>
            <span className="font-mono font-semibold text-[#e91e8c]">{order.id}</span>
          </div>
          <div className="flex justify-between gap-4 sm:block">
            <span className="text-slate-500">Invoice Date</span>
            <span className="font-medium text-slate-900">{formatInvoiceDate(order)}</span>
          </div>
          <div className="flex justify-between gap-4 sm:block">
            <span className="text-slate-500">Payment</span>
            <span className="font-medium uppercase text-slate-900">{order.paymentMethod ?? 'Paid'}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Item Name', 'Variant', 'Qty', 'Unit Price', 'Line Total'].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={`${item.name}-${index}`} className="border-b border-slate-100">
                <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3.5 text-slate-600">{item.variant}</td>
                <td className="px-4 py-3.5 text-slate-900">{item.qty}</td>
                <td className="px-4 py-3.5 text-slate-900">{formatCatalogPrice(item.price)}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-900">
                  {formatCatalogPrice(item.price * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">{formatCatalogPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Tax (GST {taxPercent}%)</span>
            <span className="font-medium text-slate-900">{formatCatalogPrice(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-900">
            <span>Total Paid</span>
            <span>{formatCatalogPrice(grandTotal)}</span>
          </div>
        </div>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        <p>Thank you for shopping with {INVOICE_COMPANY.name}.</p>
        <p className="mt-1">This is a computer-generated invoice and does not require a signature.</p>
      </footer>
    </article>
  );
}

export function OrderSuccess({ order }) {
  const handlePrintInvoice = useCallback(() => {
    window.print();
  }, []);

  if (!order) return null;

  const activeIndex = ORDER_STATUSES.findIndex((step) => step.key === 'confirmed');

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 14mm; }
              html, body { background: white !important; }
              body * { visibility: hidden; }
              [data-order-invoice-print],
              [data-order-invoice-print] * { visibility: visible; }
              [data-order-invoice-print] {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 14mm !important;
                background: white !important;
              }
            }
          `,
        }}
      />

      <div className="print:hidden">
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

            <div className="mt-8 inline-flex items-center gap-2 border border-borderColor bg-white px-5 py-3 shadow-sm dark:bg-[#150d22]">
              <Package className="h-4 w-4 text-magenta" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-gray-400">
                Order ID
              </span>
              <span className="font-playfair text-base font-semibold text-slate-900 dark:text-white">
                {formatOrderDisplayId(order.id)}
              </span>
            </div>

            <div className="mt-10 rounded-none border border-borderColor bg-white p-6 text-left shadow-sm dark:bg-[#150d22]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-700 dark:text-gray-400">
                Order Lifecycle
              </p>
              <div className="mt-5 space-y-4">
                {ORDER_STATUSES.map((step, index) => {
                  const completed = index <= activeIndex;
                  const isCurrent = step.key === order.status?.toLowerCase();

                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                          completed
                            ? 'border-magenta bg-magenta text-white'
                            : 'border-borderColor bg-white text-slate-700 dark:bg-[#150d22] dark:text-gray-400',
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
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCatalogPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link
                href="/closet"
                className="inline-flex items-center justify-center gap-2 bg-magenta px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-magenta"
              >
                <Package className="h-4 w-4" />
                View Personal Closet
              </Link>
              <button
                type="button"
                onClick={handlePrintInvoice}
                className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-900 transition-colors hover:border-magenta hover:text-magenta dark:border-white/15 dark:bg-[#150d22] dark:text-white"
              >
                <FileText className="h-4 w-4" />
                Download Bill
              </button>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-900 transition-colors hover:border-magenta dark:border-white/15 dark:bg-[#150d22] dark:text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <OrderConfirmationInvoice order={order} />
    </>
  );
}
