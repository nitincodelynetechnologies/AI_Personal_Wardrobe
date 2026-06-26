import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  profile: null,
  preferences: null,
  fashionDna: null,
  onboardingComplete: false,
};

export const useProfileStore = create(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      setPreferences: (preferences) => set({ preferences }),

      setFashionDna: (fashionDna) => set({ fashionDna }),

      completeOnboarding: ({ profile, preferences, fashionDna }) =>
        set({
          profile: profile ?? null,
          preferences: preferences ?? null,
          fashionDna: fashionDna ?? null,
          onboardingComplete: true,
        }),

      syncFromServer: ({ profile, preferences, onboardingComplete }) =>
        set({
          profile: profile ?? null,
          preferences: preferences ?? null,
          onboardingComplete: Boolean(onboardingComplete),
        }),

      resetProfile: () => set({ ...initialState }),
    }),
    {
      name: 'wardrobe-profile',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        fashionDna: state.fashionDna,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
);
