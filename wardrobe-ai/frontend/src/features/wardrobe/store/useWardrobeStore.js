'use client';

import { create } from 'zustand';
import { DEFAULT_WARDROBE_ITEMS } from '@/features/wardrobe/constants/wardrobeDefaultItems';

export const useWardrobeStore = create((set) => ({
  items: DEFAULT_WARDROBE_ITEMS,
  categoryFilter: 'All',
  setItems: (items) =>
    set({ items: items?.length > 0 ? items : DEFAULT_WARDROBE_ITEMS }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  resetWardrobe: () => set({ items: DEFAULT_WARDROBE_ITEMS, categoryFilter: 'All' }),
}));

export function getFilteredItems(items, categoryFilter) {
  if (categoryFilter === 'All') return items;
  return items.filter((item) => item.category === categoryFilter);
}
