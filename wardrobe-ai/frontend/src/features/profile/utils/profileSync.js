import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getProfile } from '@/features/profile/services/profileService';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { enforceSessionOwnership } from '@/features/auth/utils/sessionLifecycle';

export function isOnboardingComplete(profile, preferences) {
  if (!profile || !preferences) return false;

  return Boolean(
    profile.gender &&
      profile.age != null &&
      profile.height != null &&
      profile.weight != null &&
      profile.body_type &&
      profile.skin_tone &&
      Array.isArray(preferences.favorite_colors) &&
      preferences.favorite_colors.length > 0 &&
      Array.isArray(preferences.favorite_brands) &&
      preferences.favorite_brands.length > 0 &&
      preferences.fashion_style,
  );
}

export async function syncProfileFromServer(token) {
  useProfileStore.getState().resetProfile();

  const response = await getProfile(token);
  const onboardingComplete = isOnboardingComplete(response.profile, response.preferences);

  useProfileStore.getState().syncFromServer({
    profile: response.profile,
    preferences: response.preferences,
    onboardingComplete,
  });

  enforceSessionOwnership();

  return { ...response, onboardingComplete };
}

export async function rehydrateAuthStores() {
  await Promise.all([
    useAuthStore.persist.rehydrate(),
    useProfileStore.persist.rehydrate(),
  ]);

  enforceSessionOwnership();
}

export function getPostLoginPath(onboardingComplete) {
  return onboardingComplete ? '/dashboard' : '/onboarding';
}
