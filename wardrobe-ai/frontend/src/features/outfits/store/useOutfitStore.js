import { create } from 'zustand';

export const useOutfitStore = create((set) => ({
  outfits: [],

  setOutfits: (outfits) => set({ outfits }),

  addOutfit: (outfit) =>
    set((state) => ({
      outfits: [outfit, ...state.outfits.filter((item) => item.id !== outfit.id)],
    })),

  updateOutfit: (outfitId, patch) =>
    set((state) => ({
      outfits: state.outfits.map((outfit) =>
        outfit.id === outfitId ? { ...outfit, ...patch } : outfit,
      ),
    })),

  removeOutfit: (outfitId) =>
    set((state) => ({
      outfits: state.outfits.filter((outfit) => outfit.id !== outfitId),
    })),

  resetOutfits: () => set({ outfits: [] }),
}));
