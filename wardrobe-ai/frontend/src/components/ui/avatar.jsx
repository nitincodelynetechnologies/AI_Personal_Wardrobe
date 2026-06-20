'use client';

import { cn } from '@/lib/utils';

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-champagne/40 bg-noir-elevated',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-champagne/30 to-champagne/5 text-sm font-semibold text-champagne',
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ src, alt, className }) {
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn('aspect-square h-full w-full object-cover', className)} />
  );
}
