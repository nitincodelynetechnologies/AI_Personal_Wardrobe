'use client';

import { cn } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/features/checkout/constants/checkoutOptions';

export function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const selected = value === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={cn(
              'flex items-start gap-3 border p-4 text-left transition-all duration-200',
              selected
                ? 'border-magenta bg-magenta text-white shadow-md'
                : 'border-borderColor bg-white dark:bg-[#150d22] text-slate-900 dark:text-white hover:border-gray-400',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                selected ? 'border-borderColor bg-white/5 dark:bg-[#150d22]/5' : 'border-borderColor bg-white dark:bg-[#150d22]',
              )}
            >
              <Icon className={cn('h-4 w-4', selected ? 'text-magenta' : 'text-slate-700 dark:text-gray-400')} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{method.label}</p>
              <p className={cn('mt-0.5 text-xs', selected ? 'text-slate-700 dark:text-gray-400' : 'text-slate-700 dark:text-gray-400')}>
                {method.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
