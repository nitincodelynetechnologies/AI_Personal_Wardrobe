'use client';

import { create } from 'zustand';

export const useWardrobeStore = create((set) => ({
  items: [],
  categoryFilter: 'All',
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  resetWardrobe: () => set({ items: [], categoryFilter: 'All' }),
}));

export function getFilteredItems(items, categoryFilter) {
  if (categoryFilter === 'All') return items;
  return items.filter((item) => item.category === categoryFilter);
}
