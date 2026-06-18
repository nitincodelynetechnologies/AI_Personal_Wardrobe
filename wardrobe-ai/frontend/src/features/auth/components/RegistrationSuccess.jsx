'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function RegistrationSuccess({ onContinue }) {
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 300);
    const buttonTimer = setTimeout(() => setShowButton(true), 900);
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12">
      <div className="relative mb-8">
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-champagne/20 blur-2xl',
            'animate-pulse-ring',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'relative flex h-28 w-28 items-center justify-center rounded-full',
            'border-2 border-champagne bg-gradient-to-br from-champagne/20 to-champagne/5',
            'animate-success-scale',
          )}
        >
          <ShieldCheck className="h-14 w-14 text-champagne" strokeWidth={1.5} />
        </div>

        <Sparkles
          className="absolute -right-2 -top-2 h-6 w-6 text-champagne-light animate-fade-up"
          style={{ animationDelay: '0.4s' }}
          aria-hidden
        />
        <Sparkles
          className="absolute -bottom-1 -left-3 h-5 w-5 text-champagne/70 animate-fade-up"
          style={{ animationDelay: '0.6s' }}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          'max-w-md space-y-3 text-center transition-all duration-700',
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <h2 className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
          Profile Secured
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your biometric face vector has been encrypted and stored securely.
          Welcome to your personalized AI wardrobe experience.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className={cn(
          'mt-10 min-w-[200px] rounded-lg bg-primary px-8 py-3',
          'text-sm font-medium text-primary-foreground transition-all duration-500',
          'hover:bg-primary/90 hover:shadow-lg hover:shadow-champagne/20',
          showButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        Continue to Dashboard
      </button>
    </div>
  );
}
