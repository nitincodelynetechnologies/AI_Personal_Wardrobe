'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const CameraViewfinder = forwardRef(function CameraViewfinder(
  { isReady, isVerified = false, className },
  ref,
) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-md overflow-hidden rounded-xl',
        'border border-borderColor bg-background shadow-lg',
        isVerified && 'ring-1 ring-magenta/40',
        className,
      )}
    >
      <div className="relative aspect-[4/3] max-h-64 w-full shrink-0">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            'scale-x-[-1]',
            !isReady && 'opacity-0',
          )}
          aria-label="Camera preview for face registration"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#150d22]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[55%] w-[45%] max-h-32 max-w-36">
            <div
              className={cn(
                'absolute inset-0 rounded-[50%] border-2 transition-colors duration-500',
                isVerified
                  ? 'border-magenta shadow-lg shadow-magenta/20'
                  : 'border-dashed border-violet/60 animate-pulse-ring',
              )}
              aria-hidden
            />
            <div
              className={cn(
                'absolute inset-2 rounded-[50%] border transition-colors duration-500',
                isVerified ? 'border-magenta/40' : 'border-borderColor',
              )}
              aria-hidden
            />
          </div>
        </div>

        {isReady && (
          <div
            className={cn(
              'pointer-events-none absolute left-4 right-4 top-[30%] h-px animate-scan bg-gradient-to-r from-transparent to-transparent',
              isVerified ? 'via-magenta/50' : 'via-violet/50',
            )}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
});
