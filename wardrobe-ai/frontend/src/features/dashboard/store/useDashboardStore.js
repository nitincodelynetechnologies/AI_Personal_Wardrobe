'use client';

import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  wardrobeItems: [],
  outfits: [],

  setDashboardCache: ({ wardrobeItems, outfits }) =>
    set({
      wardrobeItems: wardrobeItems ?? [],
      outfits: outfits ?? [],
    }),

  setWardrobeItems: (wardrobeItems) => set({ wardrobeItems }),
  setOutfits: (outfits) => set({ outfits }),

  addOutfit: (outfit) =>
    set((state) => ({
      outfits: [outfit, ...state.outfits.filter((item) => item.id !== outfit.id)],
    })),

  addWardrobeItem: (item) =>
    set((state) => ({
      wardrobeItems: [item, ...state.wardrobeItems.filter((entry) => entry.id !== item.id)],
    })),

  updateOutfitInCache: (outfitId, patch) =>
    set((state) => ({
      outfits: state.outfits.map((outfit) =>
        outfit.id === outfitId ? { ...outfit, ...patch } : outfit,
      ),
    })),

  removeWardrobeItem: (itemId) =>
    set((state) => ({
      wardrobeItems: state.wardrobeItems.filter((item) => item.id !== itemId),
    })),

  removeOutfit: (outfitId) =>
    set((state) => ({
      outfits: state.outfits.filter((outfit) => outfit.id !== outfitId),
    })),

  removeOutfitsByIds: (outfitIds = []) =>
    set((state) => ({
      outfits: state.outfits.filter((outfit) => !outfitIds.includes(outfit.id)),
    })),

  resetDashboard: () => set({ wardrobeItems: [], outfits: [] }),
}));
