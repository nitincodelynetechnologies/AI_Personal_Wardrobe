'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Fingerprint, ScanLine, ShieldCheck } from 'lucide-react';

const SCAN_STEPS = [
  { id: 'capture', label: 'Analyzing facial geometry', icon: ScanLine },
  { id: 'match', label: 'Matching biometric signature', icon: Fingerprint },
  { id: 'verify', label: 'Securing your session', icon: ShieldCheck },
];

export function VerificationLoader({ message = 'Verifying identity…' }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12 animate-fade-up"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative mb-10">
        <div
          className="absolute inset-0 rounded-full bg-champagne/15 blur-3xl animate-pulse-ring"
          aria-hidden
        />
        <div
          className={cn(
            'relative flex h-32 w-32 items-center justify-center rounded-full',
            'border-2 border-champagne/50 bg-noir-elevated',
          )}
        >
          <div className="absolute inset-2 rounded-full border border-champagne/20" aria-hidden />
          <Fingerprint className="h-14 w-14 text-champagne animate-pulse" aria-hidden />
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 animate-scan bg-gradient-to-b from-transparent via-champagne/50 to-transparent"
          aria-hidden
        />
      </div>

      <div className="max-w-md space-y-2 text-center">
        <h2 className="font-display text-2xl font-semibold text-gradient-gold sm:text-3xl">
          Biometric Scan
        </h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <ul className="mt-10 w-full max-w-sm space-y-3">
        {SCAN_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-500',
                isComplete && 'border-champagne/30 bg-champagne/5',
                isActive && 'border-champagne/50 bg-champagne/10',
                !isActive && !isComplete && 'border-border/40 bg-transparent opacity-50',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  isComplete && 'bg-champagne text-noir',
                  isActive && 'bg-champagne/20 text-champagne',
                  !isActive && !isComplete && 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'animate-pulse')} aria-hidden />
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  (isActive || isComplete) && 'text-foreground',
                  !isActive && !isComplete && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-champagne to-transparent bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
