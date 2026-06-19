'use client';

import { cn } from '@/lib/utils';
import { BUDGET_LEVELS } from '@/features/profile/constants/onboardingOptions';

export function BudgetSlider({ value, onChange, className }) {
  const activeLevel =
    [...BUDGET_LEVELS].reverse().find((level) => value >= level.min) ?? BUDGET_LEVELS[0];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Budget comfort zone</span>
        <span className="font-medium text-champagne">{activeLevel.label}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-noir-elevated accent-champagne"
        aria-label="Budget range"
      />

      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        {BUDGET_LEVELS.map((level) => (
          <span key={level.value}>{level.label}</span>
        ))}
      </div>
    </div>
  );
}
