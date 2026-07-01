'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { OrderInvoiceDocument } from '@/features/admin/components/OrderInvoiceDocument';

export function OrderInvoiceModal({ order, open, onClose }) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !order || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 14mm; }
              html, body { background: white !important; }
              body * { visibility: hidden; }
              [data-invoice-print-root],
              [data-invoice-print-root] * { visibility: visible; }
              [data-invoice-print-root] {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
            }
          `,
        }}
      />

      <div
        data-invoice-print-root
        className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center sm:p-8 print:fixed print:inset-0 print:z-[99999] print:overflow-visible print:bg-white print:p-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
      >
        <div
          className="absolute inset-0 print:hidden"
          onClick={onClose}
          aria-hidden
        />

        <div className="relative z-10 my-4 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl print:my-0 print:max-w-none print:rounded-none print:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 print:hidden">
            <div>
              <h2 id="invoice-modal-title" className="text-lg font-semibold text-slate-900">
                Invoice Preview
              </h2>
              <p className="text-xs text-slate-500">
                Order {order.id} · {order.customer}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full bg-[#e91e8c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Close invoice preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto bg-white p-6 sm:p-10 print:max-h-none print:overflow-visible print:p-0">
            <div className="print:p-[14mm]">
              <OrderInvoiceDocument order={order} />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
