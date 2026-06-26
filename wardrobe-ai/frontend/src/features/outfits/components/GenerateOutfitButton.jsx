'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function GenerateOutfitButton({ onClick, isLoading, className }) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'relative gap-2 overflow-hidden border-0 bg-gradient-to-r from-violet via-violet to-violet',
        'text-slate-900 dark:text-white shadow-lg shadow-violet/25 transition hover:opacity-90',
        'before:absolute before:inset-0 before:animate-pulse before:bg-white/20 dark:bg-[#150d22]/20 before:opacity-0 hover:before:opacity-100',
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isLoading ? 'Generating...' : 'Generate New Outfit'}
    </Button>
  );
}
