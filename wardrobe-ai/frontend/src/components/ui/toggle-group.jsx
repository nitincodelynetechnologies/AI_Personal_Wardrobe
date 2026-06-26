'use client';

import { cn } from '@/lib/utils';

export function ToggleGroup({ options, value, onChange, className }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
              selected
                ? 'border-violet bg-violet/15 text-violet'
                : 'border-borderColor bg-white dark:bg-[#150d22] text-muted-foreground hover:border-violet/40 hover:text-foreground',
            )}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function MultiToggleGroup({ options, values = [], onChange, className }) {
  const toggle = (optionValue) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((item) => item !== optionValue));
      return;
    }
    onChange([...values, optionValue]);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = values.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={cn(
              'min-h-11 rounded-lg border px-3 py-2 text-sm transition-all',
              selected
                ? 'border-violet bg-violet/15 text-violet'
                : 'border-borderColor bg-white dark:bg-[#150d22] text-muted-foreground hover:border-violet/40',
            )}
            aria-pressed={selected}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
