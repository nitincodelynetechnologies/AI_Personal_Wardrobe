'use client';

import { Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVATAR_TYPES } from '@/features/try-on/constants/avatarOptions';

export function AvatarTypeSelector({ value, onChange, className }) {
  const isBasic = value === AVATAR_TYPES.BASIC;
  const isPremium = value === AVATAR_TYPES.PREMIUM;

  return (
    <div className={cn('w-full shrink-0', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
        <button
          type="button"
          onClick={() => onChange(AVATAR_TYPES.BASIC)}
          aria-pressed={isBasic}
          className={cn(
            'flex flex-1 flex-col items-start rounded-xl border px-4 py-2 text-left transition-all duration-300 sm:max-w-[200px]',
            isBasic
              ? 'border-white/20 bg-white/10 text-slate-900 dark:border-white/30 dark:bg-white/10 dark:text-white'
              : 'border-borderColor bg-white/50 text-slate-600 hover:bg-white/80 dark:border-white/10 dark:bg-[#1a1028] dark:text-slate-400 dark:hover:bg-white/5',
          )}
        >
          <span className="mb-0.5 flex items-center gap-2">
            <User className="h-3.5 w-3.5 opacity-80" aria-hidden />
            <h4 className="text-sm font-bold">Basic Avatar</h4>
          </span>
          <p className="text-[11px] leading-snug opacity-70">
            Fast, simple 2D static representation.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange(AVATAR_TYPES.PREMIUM)}
          aria-pressed={isPremium}
          className={cn(
            'flex flex-1 flex-col items-start rounded-xl border px-4 py-2 text-left transition-all duration-300 sm:max-w-[220px]',
            isPremium
              ? 'border-fuchsia-500 bg-gradient-to-r from-fuchsia-600/20 to-pink-600/20 text-slate-900 shadow-[0_0_15px_rgba(217,70,239,0.3)] dark:text-white'
              : 'border-borderColor bg-white/50 text-slate-600 hover:bg-white/80 dark:border-white/10 dark:bg-[#1a1028] dark:text-slate-400 dark:hover:bg-white/5',
          )}
        >
          <span className="mb-0.5 flex items-center gap-2">
            <h4 className="text-sm font-bold">Premium Avatar</h4>
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" aria-hidden />
          </span>
          <p className="text-[11px] leading-snug opacity-70">
            Full 3D interactive model with facial projection.
          </p>
        </button>
      </div>
    </div>
  );
}
