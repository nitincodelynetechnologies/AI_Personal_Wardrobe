import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const DEFAULT_USER_FACE_URL =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80';

export const useFaceStudioStore = create(
  persist(
    (set) => ({
      userFace: null,
      boundUserId: null,

      setUserFace: (url, userId) => {
        const boundUserId = userId ?? useAuthStore.getState().user?.id ?? null;
        set({ userFace: url, boundUserId });
      },

      clearUserFace: () => set({ userFace: null, boundUserId: null }),
    }),
    {
      name: 'wardrobe-face-studio',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        userFace: state.userFace,
        boundUserId: state.boundUserId,
      }),
    },
  ),
);
