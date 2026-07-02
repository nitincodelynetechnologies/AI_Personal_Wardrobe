import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateOrderId } from '@/features/checkout/constants/checkoutOptions';
import { createOrderOnServer } from '@/features/orders/services/orderApiService';
import { ORDERS_UPDATED } from '@/features/shared/storage/platformSyncStorage';

const initialState = {
  orders: [],
  lastOrder: null,
};

export const useOrderStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      placeOrder: async ({ items, paymentMethod, shipping, total }) => {
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

        const response = await createOrderOnServer({
          id: orderId,
          items: order.items.map((item) => ({
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            productId: item.id != null ? String(item.id) : undefined,
          })),
          paymentMethod,
          shipping,
          total,
        });

        if (response?.order) {
          Object.assign(order, {
            id: response.order.id ?? orderId,
            status: response.order.status ?? order.status,
            createdAt: response.order.createdAt ?? order.createdAt,
          });
        }

        set({
          orders: [order, ...get().orders],
          lastOrder: order,
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(ORDERS_UPDATED));
        }

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
