'use client';

import { cn } from '@/lib/utils';
import { Check, User } from 'lucide-react';
import { FRONT_CAPTURE_STEP } from '@/features/auth/constants/captureSteps';

export function CaptureStepper({ captures }) {
  const isCompleted = Boolean(captures?.front);

  return (
    <div className="w-full rounded-xl border border-borderColor bg-white/40 dark:bg-[#150d22]/40 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-medium',
              isCompleted && 'border-violet bg-violet text-white',
              !isCompleted && 'border-violet/50 bg-white dark:bg-[#150d22] text-violet',
            )}
          >
            {isCompleted ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <User className="h-4 w-4" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{FRONT_CAPTURE_STEP.label}</p>
            <p className="text-xs text-muted-foreground">
              {isCompleted ? 'Capture complete' : 'Single front-facing photo required'}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-violet">{isCompleted ? '1 / 1' : '0 / 1'}</span>
      </div>
    </div>
  );
}
