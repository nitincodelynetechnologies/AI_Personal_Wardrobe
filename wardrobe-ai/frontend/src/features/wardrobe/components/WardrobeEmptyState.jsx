'use client';

import { Shirt, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WardrobeEmptyState({ onAddClick, hasFilter }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-borderColor bg-white/20 dark:bg-[#150d22]/20 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-violet/40 bg-violet/5">
        <Shirt className="h-7 w-7 text-violet/70" />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-playfair text-lg font-semibold">
          {hasFilter ? 'No items in this category' : 'Your wardrobe is empty'}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasFilter
            ? 'Try another filter or add a new piece to this category.'
            : 'Upload your favorite pieces to unlock outfit planning and AI styling.'}
        </p>
      </div>
      <Button className="gap-2" onClick={onAddClick}>
        <Upload className="h-4 w-4" />
        Add New Item
      </Button>
    </div>
  );
}
