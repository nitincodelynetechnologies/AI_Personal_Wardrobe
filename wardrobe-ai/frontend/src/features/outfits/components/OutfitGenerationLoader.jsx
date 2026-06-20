'use client';

import { Loader2, Sparkles } from 'lucide-react';

export function OutfitGenerationLoader() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-champagne/20 bg-noir-elevated p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-champagne/10">
          <Sparkles className="h-6 w-6 animate-pulse text-champagne" />
        </div>
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-champagne" />
          AI is analyzing your wardrobe...
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Pairing tops, bottoms, and footwear into a cohesive look.
        </p>
      </div>
    </div>
  );
}
