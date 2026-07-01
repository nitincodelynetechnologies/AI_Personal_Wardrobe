import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateOrderId } from '@/features/checkout/constants/checkoutOptions';

import { saveCheckoutOrder } from '@/features/shared/storage/platformSyncStorage';

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
          status: 'Pending',
          items: items.map((item) => ({ ...item })),
          paymentMethod,
          shipping,
          total,
          createdAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          saveCheckoutOrder(order);
        }

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
