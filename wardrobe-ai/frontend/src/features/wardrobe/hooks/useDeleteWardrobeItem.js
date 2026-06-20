'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/components/ui/toaster';
import { deleteWardrobeItem } from '@/features/wardrobe/services/wardrobeService';
import { useWardrobeStore } from '@/features/wardrobe/store/useWardrobeStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useDeleteWardrobeItem() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const removeItem = useWardrobeStore((state) => state.removeItem);
  const removeDashboardItem = useDashboardStore((state) => state.removeWardrobeItem);
  const removeOutfitsByIds = useDashboardStore((state) => state.removeOutfitsByIds);
  const removeOutfit = useOutfitStore((state) => state.removeOutfit);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => deleteWardrobeItem(accessToken, itemId),
    onMutate: (itemId) => {
      removeItem(itemId);
      removeDashboardItem(itemId);
    },
    onSuccess: (response, itemId) => {
      const deletedOutfitIds = response?.deleted_outfit_ids ?? [];
      deletedOutfitIds.forEach((outfitId) => removeOutfit(outfitId));
      removeOutfitsByIds(deletedOutfitIds);

      queryClient.setQueryData(['wardrobe', accessToken], (current) =>
        Array.isArray(current) ? current.filter((item) => item.id !== itemId) : current,
      );
      queryClient.setQueryData(['outfits', accessToken], (current) =>
        Array.isArray(current)
          ? current.filter((outfit) => !deletedOutfitIds.includes(outfit.id))
          : current,
      );

      showToast({ message: 'Clothing item deleted.', variant: 'success' });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe', accessToken] });
      queryClient.invalidateQueries({ queryKey: ['outfits', accessToken] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', accessToken] });
      showToast({ message: 'Unable to delete item. Please try again.', variant: 'destructive' });
    },
  });
}
