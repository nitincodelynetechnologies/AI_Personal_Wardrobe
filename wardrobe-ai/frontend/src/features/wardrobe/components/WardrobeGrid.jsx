'use client';

import { WardrobeItemCard } from '@/features/wardrobe/components/WardrobeItemCard';
import { getFilteredItems } from '@/features/wardrobe/store/useWardrobeStore';

export function WardrobeGrid({ items, categoryFilter }) {
  const filteredItems = getFilteredItems(items, categoryFilter);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in-view"
          style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
        >
          <WardrobeItemCard item={item} />
        </div>
      ))}
    </div>
  );
}
