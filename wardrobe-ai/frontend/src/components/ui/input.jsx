'use client';

import { cn } from '@/lib/utils';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-borderColor bg-white px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-500 focus-visible:border-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-[#150d22] dark:text-white dark:placeholder:text-gray-400',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-gray-400', className)}
      {...props}
    />
  );
}
