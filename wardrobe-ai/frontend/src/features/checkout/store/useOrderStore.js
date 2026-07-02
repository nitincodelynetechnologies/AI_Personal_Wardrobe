import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateOrderId } from '@/features/checkout/constants/checkoutOptions';
import { createOrderOnServer } from '@/features/admin/services/adminService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { saveCheckoutOrder } from '@/features/shared/storage/platformSyncStorage';

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

        const token = useAuthStore.getState().accessToken;

        if (token) {
          try {
            const response = await createOrderOnServer(
              {
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
              },
              token,
            );

            if (response?.order) {
              Object.assign(order, {
                id: response.order.id ?? orderId,
                status: response.order.status ?? order.status,
                createdAt: response.order.createdAt ?? order.createdAt,
              });
            }
          } catch (error) {
            console.error('Failed to persist order to API — saving locally only', error);
          }
        }

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
