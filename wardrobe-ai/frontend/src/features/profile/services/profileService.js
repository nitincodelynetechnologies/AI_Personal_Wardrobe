import { apiClient } from '@/features/auth/services/apiClient';
import { budgetSliderToRange } from '@/features/profile/constants/onboardingOptions';

export async function getProfile(token) {
  return apiClient('/profile', { token });
}

export async function updateProfile(demographics, token) {
  return apiClient('/profile', {
    method: 'PUT',
    token,
    body: {
      gender: demographics.gender,
      age: demographics.age,
      height: demographics.heightCm,
      weight: demographics.weightKg,
      body_type: demographics.bodyType,
      skin_tone: demographics.skinTone,
    },
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
