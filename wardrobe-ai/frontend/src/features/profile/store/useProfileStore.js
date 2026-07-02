import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const initialState = {
  profile: null,
  preferences: null,
  fashionDna: null,
  onboardingComplete: false,
  onboardingSkipped: false,
  onboardingSkippedForUserId: null,
};

export const useProfileStore = create(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      setPreferences: (preferences) => set({ preferences }),

      setFashionDna: (fashionDna) => set({ fashionDna }),

      completeOnboarding: ({ profile, preferences, fashionDna }) => {
        const userId = useAuthStore.getState().user?.id;
        if (typeof window !== 'undefined' && userId) {
          sessionStorage.removeItem(`wardrobe-onboarding-skipped:${userId}`);
        }

        return set({
          profile: profile ?? null,
          preferences: preferences ?? null,
          fashionDna: fashionDna ?? null,
          onboardingComplete: true,
          onboardingSkipped: false,
          onboardingSkippedForUserId: null,
        });
      },

      skipOnboarding: (userId) => {
        if (typeof window !== 'undefined' && userId) {
          sessionStorage.setItem(`wardrobe-onboarding-skipped:${userId}`, '1');
        }

        return set({
          onboardingSkipped: true,
          onboardingSkippedForUserId: userId ?? null,
          onboardingComplete: true,
        });
      },

      syncFromServer: ({
        profile,
        preferences,
        onboardingComplete,
        onboardingSkipped,
        onboardingSkippedForUserId,
      }) =>
        set({
          profile: profile ?? null,
          preferences: preferences ?? null,
          onboardingComplete: Boolean(onboardingComplete),
          onboardingSkipped: Boolean(onboardingSkipped),
          onboardingSkippedForUserId: onboardingSkippedForUserId ?? null,
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
        onboardingSkipped: state.onboardingSkipped,
        onboardingSkippedForUserId: state.onboardingSkippedForUserId,
      }),
    },
  ),
);
