import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  user: null,
  accessToken: null,
  routingToken: null,
  isAuthenticated: false,
  isFaceRegistered: false,
  faceRegistrationStatus: 'idle',
  faceLoginStatus: 'idle',
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

      completeFaceRegistration: ({ routingToken, user, accessToken }) =>
        set({
          routingToken,
          accessToken: accessToken ?? routingToken ?? null,
          user: user ?? null,
          isAuthenticated: Boolean(accessToken ?? routingToken),
          isFaceRegistered: true,
          faceRegistrationStatus: 'success',
        }),

      resetFaceRegistration: () =>
        set({
          faceRegistrationStatus: 'idle',
        }),

      setFaceLoginStatus: (faceLoginStatus) => set({ faceLoginStatus }),

      completeFaceLogin: ({ user, accessToken }) =>
        set({
          user: user ?? null,
          accessToken: accessToken ?? null,
          isAuthenticated: true,
          faceLoginStatus: 'success',
        }),

      resetFaceLogin: () =>
        set({
          faceLoginStatus: 'idle',
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
        isAuthenticated: state.isAuthenticated,
        isFaceRegistered: state.isFaceRegistered,
      }),
    },
  ),
);
