'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/features/dashboard/services/dashboardService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

export function useDashboard() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setPreferences = useProfileStore((s) => s.setPreferences);
  const setFashionDna = useProfileStore((s) => s.setFashionDna);

  return useQuery({
    queryKey: ['dashboard', accessToken],
    queryFn: async () => {
      const data = await fetchDashboardData(accessToken);
      setProfile(data.profile);
      setPreferences(data.preferences);
      setFashionDna(data.fashionDna);
      return data;
    },
    enabled: Boolean(accessToken),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
