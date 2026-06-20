'use client';

import { OutfitCard } from '@/features/outfits/components/OutfitCard';

export function OutfitsGrid({ outfits }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
    </div>
  );
}
