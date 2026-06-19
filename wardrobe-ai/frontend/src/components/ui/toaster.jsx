'use client';

import { create } from 'zustand';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 4000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toast.variant === 'destructive' ? AlertCircle : CheckCircle2;

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-fade-up',
              toast.variant === 'destructive'
                ? 'border-red-500/30 bg-red-950/90 text-red-100'
                : 'border-champagne/30 bg-noir-elevated text-foreground',
            )}
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', toast.variant === 'destructive' ? 'text-red-400' : 'text-champagne')} />
            <div className="flex-1 text-sm">{toast.message}</div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
