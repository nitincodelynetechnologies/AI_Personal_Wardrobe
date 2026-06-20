'use client';

import { create } from 'zustand';

export const useWardrobeStore = create((set) => ({
  items: [],
  categoryFilter: 'All',
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  resetWardrobe: () => set({ items: [], categoryFilter: 'All' }),
}));

export function getFilteredItems(items, categoryFilter) {
  if (categoryFilter === 'All') return items;
  return items.filter((item) => item.category === categoryFilter);
}
