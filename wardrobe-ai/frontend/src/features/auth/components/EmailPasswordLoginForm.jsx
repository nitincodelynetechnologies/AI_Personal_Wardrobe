'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import {
  AUTH_MINIMAL_INPUT,
  AUTH_PRIMARY_BUTTON,
} from '@/features/auth/components/AuthSplitShell';
import { usePasswordLogin } from '@/features/auth/hooks/usePasswordLogin';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ApiError } from '@/features/auth/services/apiClient';
import {
  getPostLoginPath,
  syncProfileFromServer,
} from '@/features/profile/utils/profileSync';

function getPasswordLoginErrorMessage(error) {
  if (!error) return 'Unable to sign in. Please try again.';

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Invalid email or password.';
    }
    if (error.status === 0) {
      return error.message;
    }
  }

  return error.message || 'Unable to sign in. Please try again.';
}

export function EmailPasswordLoginForm() {
  const router = useRouter();
  const { mutate: submitLogin, isPending, isError, error, reset } = usePasswordLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    reset();

    submitLogin(
      { email: email.trim(), password },
      {
        onSuccess: async (data) => {
          const token = data.jwt_token ?? useAuthStore.getState().accessToken;
          if (!token) {
            router.push('/onboarding');
            return;
          }

          try {
            const { onboardingComplete } = await syncProfileFromServer(token);
            router.push(getPostLoginPath(onboardingComplete));
          } catch {
            router.push('/onboarding');
          }
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-1">
        <label htmlFor="login-email" className="text-xs font-medium uppercase tracking-widest text-slate-700 dark:text-gray-400">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isPending}
          className={AUTH_MINIMAL_INPUT}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="login-password"
          className="text-xs font-medium uppercase tracking-widest text-slate-700 dark:text-gray-400"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          disabled={isPending}
          className={AUTH_MINIMAL_INPUT}
        />
      </div>

      {isError && (
        <Alert variant="destructive" className="rounded-none border-l-2 border-destructive text-sm">
          {getPasswordLoginErrorMessage(error)}
        </Alert>
      )}

      <button type="submit" disabled={isPending} className={`${AUTH_PRIMARY_BUTTON} mt-6`}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
