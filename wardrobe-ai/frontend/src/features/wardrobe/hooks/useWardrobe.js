'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWardrobeItems } from '@/features/wardrobe/services/wardrobeService';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useWardrobe() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setItems = useWardrobeStore((state) => state.setItems);
  const setWardrobeItems = useDashboardStore((state) => state.setWardrobeItems);
  const cachedItems = useWardrobeStore((state) => state.items);

  return useQuery({
    queryKey: ['wardrobe', accessToken],
    queryFn: async () => {
      const items = await fetchWardrobeItems(accessToken);
      setItems(items);
      setWardrobeItems(items);
      return items;
    },
    enabled: Boolean(accessToken),
    placeholderData: cachedItems.length ? cachedItems : undefined,
  });
}
