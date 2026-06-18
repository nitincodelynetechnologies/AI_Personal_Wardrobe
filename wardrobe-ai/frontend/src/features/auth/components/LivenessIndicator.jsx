'use client';

import { LIVENESS_CHECKS } from '@/features/auth/constants/captureSteps';
import { cn } from '@/lib/utils';
import { Eye, Move3d, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHECK_ICONS = {
  blink: Eye,
  headMovement: Move3d,
};

export function LivenessIndicator({
  checks,
  activeCheck,
  faceError,
  onConfirmBlink,
}) {
  return (
    <div className="w-full space-y-3 rounded-xl border border-white/5 bg-noir-surface/60 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Liveness Verification</h3>
        <span className="text-xs text-muted-foreground">Real-time</span>
      </div>

      <div className="space-y-2">
        {LIVENESS_CHECKS.map((check) => {
          const Icon = CHECK_ICONS[check.id] || Eye;
          const isComplete = checks[check.id];
          const isActive = activeCheck === check.id && !isComplete;

          return (
            <div
              key={check.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300',
                isComplete && 'border-champagne/30 bg-champagne/5',
                isActive && 'border-champagne/50 bg-champagne/10',
                !isComplete && !isActive && 'border-border/50 bg-transparent',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  isComplete && 'bg-champagne text-noir',
                  isActive && 'bg-champagne/20 text-champagne',
                  !isComplete && !isActive && 'bg-muted text-muted-foreground',
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isComplete && 'text-champagne-light',
                    isActive && 'text-foreground',
                    !isComplete && !isActive && 'text-muted-foreground',
                  )}
                >
                  {check.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">{check.description}</p>
              </div>

              {isActive && check.id === 'blink' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConfirmBlink}
                  className="shrink-0 border-champagne/40 text-xs hover:bg-champagne/10"
                >
                  I Blinked
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {faceError && (
        <p className="text-xs text-destructive" role="alert">
          {faceError}
        </p>
      )}

      {!faceError && checks.blink && !checks.headMovement && (
        <p className="text-xs text-muted-foreground">
          Slowly turn your head left and right to verify movement.
        </p>
      )}
    </div>
  );
}
