import { apiClient } from '@/features/auth/services/apiClient';
import { budgetSliderToRange } from '@/features/profile/constants/onboardingOptions';

export async function getProfile(token) {
  return apiClient('/profile', { token });
}

export async function updateProfile(demographics, token) {
  const body = {};

  if (demographics.gender !== undefined) body.gender = demographics.gender;
  if (demographics.age !== undefined) body.age = demographics.age;
  if (demographics.heightCm !== undefined) body.height = demographics.heightCm;
  if (demographics.weightKg !== undefined) body.weight = demographics.weightKg;
  if (demographics.bodyType !== undefined) body.body_type = demographics.bodyType;
  if (demographics.skinTone !== undefined) body.skin_tone = demographics.skinTone;

  return apiClient('/profile', {
    method: 'PUT',
    token,
    body,
  });
}

export async function updatePreferences(preferences, token) {
  return apiClient('/profile/preferences', {
    method: 'PUT',
    token,
    body: {
      favorite_colors: preferences.favoriteColors,
      favorite_brands: preferences.favoriteBrands,
      budget_range: budgetSliderToRange(preferences.budgetSlider),
      fashion_style: preferences.fashionStyle,
    },
  });
}

export async function submitOnboarding({ demographics, preferences, token }) {
  const profileResponse = await updateProfile(demographics, token);
  const preferencesResponse = await updatePreferences(preferences, token);

  return {
    profile: profileResponse.profile,
    preferences: preferencesResponse.preferences,
    fashionDna: preferencesResponse.fashion_dna,
  };
}
