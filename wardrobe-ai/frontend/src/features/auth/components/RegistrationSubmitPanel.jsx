'use client';

import { Loader2 } from 'lucide-react';
import {
  AUTH_MINIMAL_INPUT,
  AUTH_PRIMARY_BUTTON,
} from '@/features/auth/components/AuthSplitShell';

export function RegistrationSubmitPanel({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isPending,
  disabled,
}) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-widest text-slate-700 dark:text-gray-400">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={AUTH_MINIMAL_INPUT}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-widest text-slate-700 dark:text-gray-400">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          className={AUTH_MINIMAL_INPUT}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isPending || !email || password.length < 8}
        className={`${AUTH_PRIMARY_BUTTON} mt-6`}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account
          </>
        ) : (
          'Complete Registration'
        )}
      </button>
    </div>
  );
}
