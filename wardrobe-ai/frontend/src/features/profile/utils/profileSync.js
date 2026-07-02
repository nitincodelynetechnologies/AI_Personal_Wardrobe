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

export function hasSkippedOnboardingForUser(userId) {
  if (!userId) return false;

  if (typeof window !== 'undefined') {
    if (sessionStorage.getItem(`wardrobe-onboarding-skipped:${userId}`) === '1') {
      return true;
    }
  }

  const { onboardingSkipped, onboardingSkippedForUserId } = useProfileStore.getState();
  return Boolean(onboardingSkipped && onboardingSkippedForUserId === userId);
}

export function markOnboardingSkippedForUser(userId) {
  if (!userId || typeof window === 'undefined') return;
  sessionStorage.setItem(`wardrobe-onboarding-skipped:${userId}`, '1');
}

export function clearOnboardingSkippedForUser(userId) {
  if (!userId || typeof window === 'undefined') return;
  sessionStorage.removeItem(`wardrobe-onboarding-skipped:${userId}`);
}

export async function syncProfileFromServer(token) {
  const userId = useAuthStore.getState().user?.id;
  const skippedByCurrentUser = hasSkippedOnboardingForUser(userId);

  const response = await getProfile(token);
  const serverComplete = isOnboardingComplete(response.profile, response.preferences);

  useProfileStore.getState().syncFromServer({
    profile: response.profile,
    preferences: response.preferences,
    onboardingComplete: serverComplete || skippedByCurrentUser,
    onboardingSkipped: skippedByCurrentUser,
    onboardingSkippedForUserId: skippedByCurrentUser ? userId ?? null : null,
  });

  enforceSessionOwnership();

  return {
    ...response,
    onboardingComplete: serverComplete || skippedByCurrentUser,
  };
}

export async function rehydrateAuthStores() {
  await Promise.all([
    useAuthStore.persist.rehydrate(),
    useProfileStore.persist.rehydrate(),
  ]);

  enforceSessionOwnership();
}

export function getPostLoginPath(onboardingComplete) {
  const userId = useAuthStore.getState().user?.id;
  if (hasSkippedOnboardingForUser(userId) || onboardingComplete) {
    return '/dashboard';
  }
  return '/onboarding';
}
