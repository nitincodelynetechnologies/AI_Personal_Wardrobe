'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { FRONT_CAPTURE_STEP } from '@/features/auth/constants/captureSteps';

export const CameraViewfinder = forwardRef(function CameraViewfinder(
  { isReady, isVerified = false, statusMessage, className },
  ref,
) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-md overflow-hidden rounded-xl',
        'border border-white/10 bg-noir shadow-lg',
        isVerified && 'ring-1 ring-green-500/40',
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
          <div className="absolute inset-0 flex items-center justify-center bg-noir-elevated">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
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
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-dashed border-champagne/60 animate-pulse-ring',
              )}
              aria-hidden
            />
            <div
              className={cn(
                'absolute inset-2 rounded-[50%] border transition-colors duration-500',
                isVerified ? 'border-green-500/40' : 'border-white/10',
              )}
              aria-hidden
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          <div className="glass-panel rounded-lg px-3 py-2 text-center">
            <p
              className={cn(
                'text-[10px] font-medium uppercase tracking-widest sm:text-xs',
                isVerified ? 'text-green-400' : 'text-champagne/80',
              )}
            >
              {isVerified ? 'Face Verified' : FRONT_CAPTURE_STEP.label}
            </p>
            <p className="mt-0.5 text-xs text-foreground sm:text-sm">
              {statusMessage ||
                (isVerified
                  ? 'Face detected — tap capture when ready'
                  : FRONT_CAPTURE_STEP.instruction)}
            </p>
          </div>
        </div>

        {isReady && (
          <div
            className={cn(
              'pointer-events-none absolute left-4 right-4 top-[30%] h-px animate-scan bg-gradient-to-r from-transparent to-transparent',
              isVerified ? 'via-green-500/50' : 'via-champagne/50',
            )}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
});
