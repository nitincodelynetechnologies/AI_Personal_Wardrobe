'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOutfits } from '@/features/outfits/services/outfitService';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useOutfits() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setOutfits = useOutfitStore((state) => state.setOutfits);
  const setDashboardOutfits = useDashboardStore((state) => state.setOutfits);
  const cachedOutfits = useOutfitStore((state) => state.outfits);

  return useQuery({
    queryKey: ['outfits', accessToken],
    queryFn: async () => {
      const outfits = await fetchOutfits(accessToken);
      const existing = useOutfitStore.getState().outfits;

      const merged = outfits.map((outfit) => {
        const previous = existing.find((item) => item.id === outfit.id);
        if (!previous?.feedback) return outfit;

        if (previous.feedback === 'dislike' && !outfit.is_favorite) {
          return { ...outfit, feedback: 'dislike' };
        }

        if (previous.feedback === 'like' || outfit.is_favorite) {
          return { ...outfit, feedback: 'like', is_favorite: outfit.is_favorite };
        }

        return outfit;
      });

      setOutfits(merged);
      setDashboardOutfits(merged);
      return merged;
    },
    enabled: Boolean(accessToken),
    placeholderData: cachedOutfits.length ? cachedOutfits : undefined,
  });
}
