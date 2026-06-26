'use client';

import { OutfitCard } from '@/features/outfits/components/OutfitCard';

export function OutfitsGrid({ outfits }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
      {outfits.map((outfit, index) => (
        <div
          key={outfit.id}
          className="animate-fade-in-view"
          style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
        >
          <OutfitCard outfit={outfit} />
        </div>
      ))}
    </div>
  );
}
