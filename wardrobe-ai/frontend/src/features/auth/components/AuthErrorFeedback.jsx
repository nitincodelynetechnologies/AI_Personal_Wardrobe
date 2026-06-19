'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ApiError, getNetworkErrorMessage } from '@/features/auth/services/apiClient';

const ERROR_MESSAGES = {
  401: 'Face not recognized. Please try again or register a new profile.',
  404: 'No matching profile found. You may need to register first.',
  default: 'Authentication failed. Please try again.',
};

export function getFaceLoginErrorMessage(error) {
  if (!error) return ERROR_MESSAGES.default;

  const networkMessage = getNetworkErrorMessage(error);
  if (error instanceof ApiError && error.status === 0) {
    return networkMessage;
  }

  if (typeof error.message === 'string' && error.message.includes('Failed to fetch')) {
    return networkMessage;
  }

  const status = error instanceof ApiError ? error.status : error.status;

  if (status === 401 || status === 404) {
    return ERROR_MESSAGES[status];
  }

  return error.message || ERROR_MESSAGES.default;
}

export function AuthErrorFeedback({ error, onRetry, className }) {
  const message = getFaceLoginErrorMessage(error);

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-destructive/20',
        'bg-destructive/5 p-6 text-center animate-fade-up sm:p-8',
        className,
      )}
      role="alert"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
          Verification Failed
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      </div>

      <Alert variant="destructive" className="text-left text-sm">
        {message}
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onRetry} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/register/face">
            <UserPlus className="h-4 w-4" />
            Register Face
          </Link>
        </Button>
      </div>
    </div>
  );
}
