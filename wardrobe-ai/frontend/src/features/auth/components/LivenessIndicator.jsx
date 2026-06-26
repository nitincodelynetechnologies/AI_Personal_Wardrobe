'use client';

import { LIVENESS_CHECK } from '@/features/auth/constants/captureSteps';
import { cn } from '@/lib/utils';
import { Check, Loader2, ShieldCheck } from 'lucide-react';

export function LivenessIndicator({ isVerified, isVerifying, statusMessage }) {
  return (
    <div className="w-full shrink-0 rounded-xl border border-borderColor bg-white/60 dark:bg-[#150d22]/60 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">Real-Time Face Detection</h3>
        <span className="text-xs text-muted-foreground">
          {isVerified ? 'Face detected' : isVerifying ? 'Scanning…' : 'Waiting'}
        </span>
      </div>

      <div
        className={cn(
          'mt-3 flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-300',
          isVerified && 'border-magenta/30 bg-magenta/5',
          isVerifying && 'border-violet/50 bg-violet/10',
          !isVerified && !isVerifying && 'border-border/50 bg-transparent',
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            isVerified && 'bg-magenta text-white',
            isVerifying && 'bg-violet/20 text-violet',
            !isVerified && !isVerifying && 'bg-muted text-muted-foreground',
          )}
        >
          {isVerified ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : isVerifying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium',
              isVerified && 'text-magenta',
              isVerifying && 'text-foreground',
              !isVerified && !isVerifying && 'text-muted-foreground',
            )}
          >
            {LIVENESS_CHECK.label}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {statusMessage ||
              (isVerified
                ? 'Ready to capture'
                : isVerifying
                  ? LIVENESS_CHECK.description
                  : 'Capture your front face to begin')}
          </p>
        </div>
      </div>
    </div>
  );
}
