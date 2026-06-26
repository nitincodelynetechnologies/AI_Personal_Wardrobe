'use client';

import { cn } from '@/lib/utils';

export function FaceOverlay({ src, className }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt="Your face profile"
      className={cn(
        'pointer-events-none absolute left-1/2 top-[10%] z-10 h-[14%] w-[11%] min-h-12 min-w-10 max-h-28 max-w-24 -translate-x-1/2 rounded-[40%] object-cover',
        'border border-magenta/50 shadow-[0_0_15px_rgba(233,30,140,0.5)]',
        className,
      )}
    />
  );
}
