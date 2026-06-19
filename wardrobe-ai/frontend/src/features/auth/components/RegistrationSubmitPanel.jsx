'use client';

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-4 rounded-xl border border-white/5 bg-noir-elevated/50 p-4 sm:p-5">
      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-noir px-3 py-2 text-sm text-foreground outline-none ring-champagne/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            className="w-full rounded-lg border border-white/10 bg-noir px-3 py-2 text-sm text-foreground outline-none ring-champagne/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </label>
      </div>

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={disabled || isPending || !email || password.length < 8}
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" />
        {isPending ? 'Securing Your Profile…' : 'Complete Registration'}
      </Button>
    </div>
  );
}
