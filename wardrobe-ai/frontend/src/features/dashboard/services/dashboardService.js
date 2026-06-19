import { apiClient, ApiError } from '@/features/auth/services/apiClient';
import { getProfile } from '@/features/profile/services/profileService';

export async function getFashionDna(token) {
  try {
    return await apiClient('/fashion-dna', { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchDashboardData(token) {
  const [profileResponse, fashionDna] = await Promise.all([
    getProfile(token),
    getFashionDna(token),
  ]);

  return {
    profile: profileResponse.profile,
    preferences: profileResponse.preferences,
    fashionDna,
  };
}
