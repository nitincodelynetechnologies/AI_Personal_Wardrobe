'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OutfitsEmptyState({ onGenerateClick, isGenerating }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-borderColor bg-white/20 dark:bg-[#150d22]/20 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-violet/40 bg-violet/5">
        <Sparkles className="h-7 w-7 text-violet/70" />
      </div>
      <div className="max-w-md space-y-1">
        <p className="font-playfair text-lg font-semibold">You have no outfits yet</p>
        <p className="text-sm text-muted-foreground">
          Let AI build your first look from the clothes already in your wardrobe.
        </p>
      </div>
      <Button
        className="gap-2 bg-gradient-to-r from-violet via-violet to-violet text-slate-900 dark:text-white shadow-lg shadow-violet/20 hover:opacity-90"
        onClick={onGenerateClick}
        disabled={isGenerating}
      >
        <Sparkles className="h-4 w-4" />
        Generate First Outfit
      </Button>
    </div>
  );
}
