'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ScanFace } from 'lucide-react';

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
  const showAlignedBorder = isVerified || isVerifying;

  const statusTitle = isVerifying
    ? 'Verifying Biometrics'
    : isVerified
      ? 'Face Aligned'
      : isLivenessPending
        ? 'Align Your Face'
        : !isReady
          ? 'Camera'
          : 'Face Detection';

  const statusDetail = isVerifying
    ? 'Matching your face profile'
    : !isReady
      ? 'Starting camera…'
      : statusMessage ||
        (isVerified
          ? 'Capturing and signing you in…'
          : isLivenessPending
            ? 'Scanning for a single face…'
            : 'Center your face in the oval');

  const showSpinner = isVerifying || isLivenessPending || !isReady;

  return (
    <div className={cn('w-full', className)}>
      <div
        id="video-feed"
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-t-2xl bg-white dark:bg-[#150d22]',
          showAlignedBorder && 'ring-1 ring-inset ring-magenta/40',
        )}
      >
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
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#150d22]">
            <Loader2 className="h-10 w-10 animate-spin text-magenta" aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[55%] w-[45%] max-h-32 max-w-36">
            <div
              className={cn(
                'absolute inset-0 rounded-[50%] border-2 transition-colors duration-500',
                showAlignedBorder
                  ? 'border-magenta shadow-lg shadow-magenta/20'
                  : 'animate-pulse-ring border-dashed border-magenta/50',
              )}
              aria-hidden
            />
            <div
              className={cn(
                'absolute inset-2 rounded-[50%] border transition-colors duration-500',
                showAlignedBorder ? 'border-magenta/40' : 'border-borderColor',
              )}
              aria-hidden
            />

            {isReady && !showAlignedBorder && !isLivenessPending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanFace className="h-8 w-8 text-magenta/40" aria-hidden />
              </div>
            )}
          </div>
        </div>

        {isReady && !isVerifying && (
          <div
            className={cn(
              'pointer-events-none absolute left-4 right-4 top-[30%] h-px animate-scan bg-gradient-to-r from-transparent to-transparent',
              showAlignedBorder ? 'via-magenta/50' : 'via-magenta/30',
            )}
            aria-hidden
          />
        )}
      </div>

      <div
        id="verification-status"
        className="flex flex-col items-center justify-center gap-3 rounded-b-2xl border border-t border-borderColor bg-white dark:bg-[#150d22] p-6"
        role="status"
        aria-live="polite"
        aria-label={isVerifying ? 'Verifying biometrics' : statusTitle}
      >
        {showSpinner && (
          <Loader2
            className={cn(
              'h-8 w-8 animate-spin',
              isVerifying ? 'text-magenta' : 'text-violet',
            )}
            aria-hidden
          />
        )}

        <p
          className={cn(
            'font-sans text-sm font-medium text-slate-900 dark:text-white',
            isVerifying && 'text-base',
          )}
        >
          {isVerifying ? 'Verifying Biometrics…' : statusTitle}
        </p>

        <p className="text-center font-sans text-xs text-slate-700 dark:text-gray-400">{statusDetail}</p>
      </div>
    </div>
  );
});
