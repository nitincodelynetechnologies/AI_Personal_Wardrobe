'use client';

import { ONBOARDING_STEPS } from '@/features/profile/constants/onboardingOptions';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function OnboardingStepper({ currentStep }) {
  return (
    <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
      {ONBOARDING_STEPS.map((step, index) => {
        const isComplete = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
                  isComplete && 'border-violet bg-violet text-white',
                  isCurrent && 'border-violet bg-violet/15 text-violet scale-110',
                  !isComplete && !isCurrent && 'border-borderColor text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'hidden text-[10px] font-medium sm:block',
                  isCurrent ? 'text-violet' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-16',
                  isComplete ? 'bg-violet' : 'bg-white/5 dark:bg-[#150d22]/5',
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
