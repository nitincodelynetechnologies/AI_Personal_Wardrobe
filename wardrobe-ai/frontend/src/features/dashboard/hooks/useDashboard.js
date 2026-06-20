'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/features/dashboard/services/dashboardService';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';

export function useDashboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setPreferences = useProfileStore((state) => state.setPreferences);
  const setFashionDna = useProfileStore((state) => state.setFashionDna);
  const setDashboardCache = useDashboardStore((state) => state.setDashboardCache);
  const setWardrobeItems = useWardrobeStore((state) => state.setItems);
  const setOutfits = useOutfitStore((state) => state.setOutfits);
  const cachedWardrobeItems = useDashboardStore((state) => state.wardrobeItems);
  const cachedOutfits = useDashboardStore((state) => state.outfits);

  return useQuery({
    queryKey: ['dashboard', accessToken],
    queryFn: async () => {
      const data = await fetchDashboardData(accessToken);
      setProfile(data.profile);
      setPreferences(data.preferences);
      setFashionDna(data.fashionDna);
      setDashboardCache({
        wardrobeItems: data.wardrobeItems,
        outfits: data.outfits,
      });
      setWardrobeItems(data.wardrobeItems);
      setOutfits(data.outfits);
      return data;
    },
    enabled: Boolean(accessToken),
    staleTime: 60 * 1000,
    retry: 1,
    placeholderData:
      cachedWardrobeItems.length || cachedOutfits.length
        ? {
            wardrobeItems: cachedWardrobeItems,
            outfits: cachedOutfits,
          }
        : undefined,
  });
}
