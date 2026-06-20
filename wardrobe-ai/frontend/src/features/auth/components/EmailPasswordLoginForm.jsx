'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { usePasswordLogin } from '@/features/auth/hooks/usePasswordLogin';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { ApiError } from '@/features/auth/services/apiClient';

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
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);
  const { mutate: submitLogin, isPending, isError, error, reset } = usePasswordLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    reset();

    submitLogin(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          router.push(onboardingComplete ? '/dashboard' : '/onboarding');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          disabled={isPending}
        />
      </div>

      {isError && (
        <Alert variant="destructive" className="text-sm">
          {getPasswordLoginErrorMessage(error)}
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in with Email'
        )}
      </Button>
    </form>
  );
}
