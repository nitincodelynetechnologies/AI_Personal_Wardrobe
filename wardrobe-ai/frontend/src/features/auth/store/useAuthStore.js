import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  user: null,
  accessToken: null,
  routingToken: null,
  isFaceRegistered: false,
  faceRegistrationStatus: 'idle',
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setRoutingToken: (routingToken) => set({ routingToken }),

      setFaceRegistered: (isFaceRegistered) => set({ isFaceRegistered }),

      setFaceRegistrationStatus: (faceRegistrationStatus) =>
        set({ faceRegistrationStatus }),

      completeFaceRegistration: ({ routingToken, user }) =>
        set({
          routingToken,
          user: user ?? null,
          isFaceRegistered: true,
          faceRegistrationStatus: 'success',
        }),

      resetFaceRegistration: () =>
        set({
          faceRegistrationStatus: 'idle',
        }),

      logout: () => set({ ...initialState }),
    }),
    {
      name: 'wardrobe-auth',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        routingToken: state.routingToken,
        isFaceRegistered: state.isFaceRegistered,
      }),
    },
  ),
);
