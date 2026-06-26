import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toCommerceProduct } from '@/features/commerce/utils/commerceProduct';

const initialState = {
  items: [],
  isOpen: false,
};

function normalizeItems(items = []) {
  return items.map((item) => ({
    ...item,
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Number(item.price) || 0,
  }));
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      addToCart: (product, quantity = 1) => {
        const normalized = toCommerceProduct(product);
        if (!normalized) return;

        const amount = Math.max(1, quantity);
        const existing = get().items.find((item) => item.id === normalized.id);

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === normalized.id
                ? { ...item, quantity: item.quantity + amount }
                : item,
            ),
            isOpen: true,
          });
          return;
        }

        set({
          items: [...get().items, { ...normalized, quantity: amount }],
          isOpen: true,
        });
      },

      removeFromCart: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== String(productId)),
        });
      },

      updateQuantity: (productId, quantity) => {
        const nextQuantity = Number(quantity);
        if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
          get().removeFromCart(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === String(productId) ? { ...item, quantity: nextQuantity } : item,
          ),
        });
      },

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getEstimatedTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      resetCart: () => set({ ...initialState }),
    }),
    {
      name: 'wardrobe-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        items: normalizeItems(persisted?.items ?? current.items),
        isOpen: false,
      }),
    },
  ),
);
