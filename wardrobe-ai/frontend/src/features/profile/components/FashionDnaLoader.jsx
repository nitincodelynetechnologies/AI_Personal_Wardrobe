'use client';

import { Sparkles } from 'lucide-react';

export function FashionDnaLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-pulse-ring rounded-full bg-violet/20 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet bg-violet/10">
          <Sparkles className="h-9 w-9 animate-pulse text-violet" />
        </div>
      </div>
      <h2 className="font-playfair text-2xl font-semibold text-gradient-gold">
        Analyzing Style Profile…
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Our AI is crafting your unique Fashion DNA from your preferences.
      </p>
    </div>
  );
}
