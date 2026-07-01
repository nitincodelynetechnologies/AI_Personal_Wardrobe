import { create } from 'zustand';

export const useOrderHistoryStore = create((set) => ({
  isOpen: false,
  openOrderHistory: () => set({ isOpen: true }),
  closeOrderHistory: () => set({ isOpen: false }),
  toggleOrderHistory: () => set((state) => ({ isOpen: !state.isOpen })),
}));
