'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWardrobeItems } from '@/features/wardrobe/services/wardrobeService';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useWardrobe() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setItems = useWardrobeStore((state) => state.setItems);

  return useQuery({
    queryKey: ['wardrobe', accessToken],
    queryFn: async () => {
      const items = await fetchWardrobeItems(accessToken);
      setItems(items);
      return items;
    },
    enabled: Boolean(accessToken),
  });
}
