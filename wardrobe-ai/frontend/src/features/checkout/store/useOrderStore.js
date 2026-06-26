import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateOrderId } from '@/features/checkout/constants/checkoutOptions';

const initialState = {
  orders: [],
  lastOrder: null,
};

export const useOrderStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      placeOrder: ({ items, paymentMethod, shipping, total }) => {
        const orderId = generateOrderId();
        const order = {
          id: orderId,
          status: 'Confirmed',
          items: items.map((item) => ({ ...item })),
          paymentMethod,
          shipping,
          total,
          createdAt: new Date().toISOString(),
        };

        set({
          orders: [order, ...get().orders],
          lastOrder: order,
        });

        return order;
      },

      clearLastOrder: () => set({ lastOrder: null }),

      resetOrders: () => set({ ...initialState }),
    }),
    {
      name: 'wardrobe-orders',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        orders: state.orders,
        lastOrder: state.lastOrder,
      }),
    },
  ),
);
