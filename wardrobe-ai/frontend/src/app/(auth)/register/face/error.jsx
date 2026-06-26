'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function FaceRegisterError({ error, reset }) {
  useEffect(() => {
    console.error('[FaceRegistration]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden px-4">
      <div className="w-full max-w-md space-y-6 text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
          <span className="text-2xl" aria-hidden>
            !
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="font-playfair text-2xl font-semibold">Something Went Wrong</h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load the face registration experience. Please try again.
          </p>
        </div>

        <Alert variant="destructive" className="text-left">
          {error?.message || 'An unexpected error occurred.'}
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg">
            Try Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.assign('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
