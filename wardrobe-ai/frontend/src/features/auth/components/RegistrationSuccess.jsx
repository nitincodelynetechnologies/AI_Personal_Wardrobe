'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sparkles, ShieldCheck } from 'lucide-react';

const REDIRECT_DELAY_MS = 2500;

export function RegistrationSuccess({ redirectTo = '/onboarding' }) {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 200);
    const redirectTimer = setTimeout(() => router.push(redirectTo), REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(redirectTimer);
    };
  }, [router, redirectTo]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-10">
      <div className="relative mb-6">
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-champagne/20 blur-2xl',
            'animate-pulse-ring',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'relative flex h-24 w-24 items-center justify-center rounded-full',
            'border-2 border-champagne bg-gradient-to-br from-champagne/20 to-champagne/5',
            'animate-success-scale',
          )}
        >
          <ShieldCheck className="h-12 w-12 text-champagne" strokeWidth={1.5} />
        </div>

        <Sparkles
          className="absolute -right-2 -top-2 h-5 w-5 text-champagne-light animate-fade-up"
          style={{ animationDelay: '0.4s' }}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          'max-w-md space-y-3 text-center transition-all duration-700',
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <h2 className="font-display text-2xl font-semibold text-gradient-gold sm:text-3xl">
          Registration Complete
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your biometric profile is secured. Let&apos;s personalize your style next…
        </p>
      </div>
    </div>
  );
}
