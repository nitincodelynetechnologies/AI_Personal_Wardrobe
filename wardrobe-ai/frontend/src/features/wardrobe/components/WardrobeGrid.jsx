'use client';

import { WardrobeItemCard } from '@/features/wardrobe/components/WardrobeItemCard';
import { getFilteredItems } from '@/features/wardrobe/store/useWardrobeStore';

export function WardrobeGrid({ items, categoryFilter }) {
  const filteredItems = getFilteredItems(items, categoryFilter);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {filteredItems.map((item) => (
        <WardrobeItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
