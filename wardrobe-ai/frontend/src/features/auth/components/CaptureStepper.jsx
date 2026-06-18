'use client';

import { CAPTURE_STEPS } from '@/features/auth/constants/captureSteps';
import { cn } from '@/lib/utils';
import { Check, User } from 'lucide-react';

const STEP_ICONS = {
  front: '○',
  left: '◁',
  right: '▷',
  smile: '☺',
};

export function CaptureStepper({ currentStepIndex, captures }) {
  const completedCount = Object.keys(captures).length;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
        <span>Capture Progress</span>
        <span className="font-medium text-champagne">
          {completedCount} / {CAPTURE_STEPS.length}
        </span>
      </div>

      <div className="relative flex w-full items-center justify-between">
        <div
          className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-border"
          aria-hidden
        />
        <div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-champagne transition-all duration-500"
          style={{
            width: `${(completedCount / CAPTURE_STEPS.length) * 100}%`,
          }}
          aria-hidden
        />

        {CAPTURE_STEPS.map((step, index) => {
          const isCompleted = Boolean(captures[step.id]);
          const isCurrent = index === currentStepIndex && !isCompleted;
          const isUpcoming = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-300 sm:h-10 sm:w-10 sm:text-sm',
                  isCompleted && 'border-champagne bg-champagne text-noir',
                  isCurrent && 'border-champagne bg-noir-elevated text-champagne scale-110 shadow-lg shadow-champagne/20',
                  isUpcoming && 'border-border bg-noir-surface text-muted-foreground',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <span aria-hidden>{STEP_ICONS[step.icon] || <User className="h-4 w-4" />}</span>
                )}
              </div>
              <span
                className={cn(
                  'hidden text-[10px] font-medium sm:block sm:text-xs',
                  isCurrent && 'text-champagne',
                  isCompleted && 'text-foreground',
                  isUpcoming && 'text-muted-foreground',
                )}
              >
                {step.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
