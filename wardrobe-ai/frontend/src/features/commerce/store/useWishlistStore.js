import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toCommerceProduct } from '@/features/commerce/utils/commerceProduct';

const initialState = {
  items: [],
  isOpen: false,
};

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      toggleWishlist: (product) => {
        const normalized = toCommerceProduct(product);
        if (!normalized) return false;

        const exists = get().items.some((item) => item.id === normalized.id);

        if (exists) {
          set({
            items: get().items.filter((item) => item.id !== normalized.id),
          });
          return false;
        }

        set({ items: [...get().items, normalized] });
        return true;
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.id === String(productId)),

      removeFromWishlist: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== String(productId)),
        });
      },

      openWishlist: () => set({ isOpen: true }),

      closeWishlist: () => set({ isOpen: false }),

      getTotalItems: () => get().items.length,

      resetWishlist: () => set({ ...initialState }),
    }),
    {
      name: 'wardrobe-wishlist',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        isOpen: false,
      }),
    },
  ),
);
