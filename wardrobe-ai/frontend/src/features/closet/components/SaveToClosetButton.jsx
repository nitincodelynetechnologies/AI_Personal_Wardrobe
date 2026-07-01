'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import {
  addToPersonalCloset,
  isInPersonalCloset,
  outfitToClosetEntry,
} from '@/features/closet/utils/personalClosetStorage';

export function SaveToClosetButton({ outfit, className }) {
  const showToast = useToastStore((state) => state.showToast);

  const handleSaveToCloset = (event) => {
    event.stopPropagation();

    const entry = outfitToClosetEntry(outfit);

    if (!entry.image && !entry.pieces?.top?.image_url) {
      showToast({
        message: 'This outfit has no preview image to save yet.',
        variant: 'destructive',
      });
      return;
    }

    if (isInPersonalCloset(entry)) {
      showToast({
        message: 'This look is already in your Personal Closet.',
        variant: 'default',
      });
      return;
    }

    const saved = addToPersonalCloset(entry);

    if (!saved) {
      showToast({
        message: 'Could not save to closet. Storage may be full — try again.',
        variant: 'destructive',
      });
      return;
    }

    showToast({
      message: '✨ Added to your Personal Closet!',
      variant: 'success',
    });
  };

  return (
    <button
      type="button"
      onClick={handleSaveToCloset}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-transform hover:scale-[1.01] active:scale-[0.99]',
        className,
      )}
    >
      <Heart className="h-4 w-4 fill-current" aria-hidden />
      Save to Closet
    </button>
  );
}
