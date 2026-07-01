'use client';

import { Sparkles } from 'lucide-react';
import { formatAdminCurrency } from '@/features/admin/constants/adminMockData';
import {
  computeInvoiceTotals,
  formatInvoiceDate,
  formatLineTotal,
  INVOICE_COMPANY,
  INVOICE_TAX_RATE,
} from '@/features/admin/utils/orderInvoiceUtils';

export function OrderInvoiceDocument({ order }) {
  if (!order) return null;

  const { lineItems, subtotal, tax, grandTotal } = computeInvoiceTotals(order);
  const taxPercent = Math.round(INVOICE_TAX_RATE * 100);

  return (
    <article
      data-invoice-document
      className="mx-auto w-full max-w-[210mm] bg-white text-black print:max-w-none print:bg-white print:text-black"
    >
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 print:border-slate-300 print:bg-white"
            aria-hidden
          >
            <Sparkles className="h-7 w-7 text-[#e91e8c]" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">{INVOICE_COMPANY.name}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{INVOICE_COMPANY.tagline}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {INVOICE_COMPANY.address}
              <br />
              {INVOICE_COMPANY.city}
              <br />
              {INVOICE_COMPANY.email}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="font-playfair text-4xl font-bold tracking-tight text-slate-900">INVOICE</h1>
          <p className="mt-1 text-xs text-slate-500">GSTIN: {INVOICE_COMPANY.gstin}</p>
        </div>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 print:border-slate-200 print:bg-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Bill To</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{order.customer}</p>
          <p className="text-sm text-slate-600">{order.email}</p>
        </div>

        <div className="space-y-2 text-sm sm:text-right">
          <div className="flex justify-between gap-4 sm:block">
            <span className="text-slate-500">Order ID</span>
            <span className="font-mono font-semibold text-[#e91e8c]">{order.id}</span>
          </div>
          <div className="flex justify-between gap-4 sm:block">
            <span className="text-slate-500">Invoice Date</span>
            <span className="font-medium text-slate-900">{formatInvoiceDate(order.date)}</span>
          </div>
          <div className="flex justify-between gap-4 sm:block">
            <span className="text-slate-500">Order Status</span>
            <span className="font-medium capitalize text-slate-900">{order.status}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 print:rounded-none">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 print:bg-white">
              {['Item Name', 'Variant / Size', 'Qty', 'Unit Price', 'Line Total'].map((heading) => (
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
                <td className="px-4 py-3.5 text-slate-900">{formatAdminCurrency(item.price)}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-900">{formatLineTotal(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">{formatAdminCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Tax (GST {taxPercent}%)</span>
            <span className="font-medium text-slate-900">{formatAdminCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-900">
            <span>Grand Total</span>
            <span>{formatAdminCurrency(grandTotal)}</span>
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
