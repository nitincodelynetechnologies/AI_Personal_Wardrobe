'use client';

import { cn } from '@/lib/utils';

export function AdminChartTooltip({
  active,
  payload,
  label,
  valuePrefix = '₹',
  valueFormatter,
  className,
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const rawValue = entry?.value;
  const formatted =
    typeof valueFormatter === 'function'
      ? valueFormatter(rawValue)
      : `${valuePrefix}${Number(rawValue).toLocaleString('en-IN')}`;

  return (
    <div
      className={cn(
        'pointer-events-none rounded-lg border border-white/10 bg-[#150d22] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-playfair text-lg font-semibold text-magenta">{formatted}</p>
      {entry?.payload?.growth != null && (
        <p
          className={cn(
            'mt-1 text-xs font-semibold',
            entry.payload.growth >= 0 ? 'text-emerald-400' : 'text-rose-400',
          )}
        >
          {entry.payload.growth >= 0 ? '+' : ''}
          {entry.payload.growth}% MoM
        </p>
      )}
    </div>
  );
}
