'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ScanFace } from 'lucide-react';

export const LoginCameraView = forwardRef(function LoginCameraView(
  {
    isReady,
    isVerified = false,
    isLivenessPending = false,
    isVerifying = false,
    statusMessage,
    className,
  },
  ref,
) {
  const showGreenBorder = isVerified || isVerifying;

  const overlayTitle = isVerifying
    ? 'Verifying Biometrics'
    : isVerified
      ? 'Face Aligned'
      : isLivenessPending
        ? 'Align Your Face'
        : !isReady
          ? 'Camera'
          : 'Face Detection';

  const overlayMessage = isVerifying
    ? 'Please hold still…'
    : !isReady
      ? 'Starting camera…'
      : statusMessage ||
        (isVerified
          ? 'Capturing and signing you in…'
          : isLivenessPending
            ? 'Scanning for a single face…'
            : 'Center your face in the oval');

  return (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden',
        'bg-card',
        showGreenBorder && 'ring-1 ring-green-500/40',
        className,
      )}
    >
      <div className="relative aspect-video w-full shrink-0 sm:max-h-72">
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
          aria-label="Camera preview for face login"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {isVerifying && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-label="Verifying biometrics"
          >
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-foreground">Verifying Biometrics…</p>
            <p className="mt-1 text-xs text-muted-foreground">Matching your face profile</p>
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
                showGreenBorder
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-dashed border-primary/50 animate-pulse-ring',
              )}
              aria-hidden
            />
            <div
              className={cn(
                'absolute inset-2 rounded-[50%] border transition-colors duration-500',
                showGreenBorder ? 'border-green-500/40' : 'border-border',
              )}
              aria-hidden
            />

            {isReady && !showGreenBorder && !isLivenessPending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanFace className="h-8 w-8 text-primary/40" aria-hidden />
              </div>
            )}
          </div>
        </div>

        {isReady && !isVerifying && (
          <div
            className={cn(
              'pointer-events-none absolute left-4 right-4 top-[30%] h-px animate-scan bg-gradient-to-r from-transparent to-transparent',
              showGreenBorder ? 'via-green-500/50' : 'via-primary/50',
            )}
            aria-hidden
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          <div className="glass-panel rounded-lg px-3 py-2 text-center">
            <p
              className={cn(
                'text-[10px] font-medium uppercase tracking-widest sm:text-xs',
                showGreenBorder ? 'text-green-400' : 'text-primary/80',
              )}
            >
              {overlayTitle}
            </p>
            <p className="mt-0.5 text-xs text-foreground sm:text-sm">{overlayMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
