'use client';

import { cn } from '@/lib/utils';

const MODES = [
  { id: 'face', label: 'Face Studio', accent: 'fuchsia' },
  { id: 'body', label: 'Body Analysis', accent: 'emerald' },
];

export function StyleProfileModeTabs({ activeMode, onChange, className }) {
  return (
    <div
      className={cn(
        'inline-flex w-full max-w-md rounded-xl border border-white/10 bg-[#150d22]/80 p-1 shadow-inner',
        className,
      )}
      role="tablist"
      aria-label="Style profile analysis mode"
    >
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode.id)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300',
              isActive && mode.id === 'face' &&
                'bg-gradient-to-r from-pink-600/90 to-fuchsia-600/90 text-white shadow-[0_0_18px_rgba(217,70,239,0.35)]',
              isActive && mode.id === 'body' &&
                'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-[0_0_18px_rgba(16,185,129,0.35)]',
              !isActive && 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
