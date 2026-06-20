'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useToastStore } from '@/components/ui/toaster';
import { deleteOutfit } from '@/features/outfits/services/outfitService';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

function removeOutfitFromList(list, outfitId) {
  return Array.isArray(list) ? list.filter((outfit) => outfit.id !== outfitId) : list;
}

export function useDeleteOutfit() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const removeOutfit = useOutfitStore((state) => state.removeOutfit);
  const removeDashboardOutfit = useDashboardStore((state) => state.removeOutfit);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId) => {
      if (!accessToken) {
        throw new ApiError('You must be signed in to delete outfits.', 401);
      }
      return deleteOutfit(accessToken, outfitId);
    },
    onMutate: async (outfitId) => {
      const previousOutfits = useOutfitStore.getState().outfits;
      const previousDashboardOutfits = useDashboardStore.getState().outfits;
      const previousQueryOutfits = queryClient.getQueryData(['outfits', accessToken]);
      const previousDashboardQuery = queryClient.getQueryData(['dashboard', accessToken]);

      removeOutfit(outfitId);
      removeDashboardOutfit(outfitId);
      queryClient.setQueryData(['outfits', accessToken], (current) =>
        removeOutfitFromList(current, outfitId),
      );
      queryClient.setQueryData(['dashboard', accessToken], (current) => {
        if (!current || typeof current !== 'object') return current;
        return {
          ...current,
          outfits: removeOutfitFromList(current.outfits, outfitId),
        };
      });

      return { previousOutfits, previousDashboardOutfits, previousQueryOutfits, previousDashboardQuery };
    },
    onSuccess: () => {
      showToast({ message: 'Outfit deleted.', variant: 'success' });
    },
    onError: (error, _outfitId, context) => {
      if (context?.previousOutfits) {
        useOutfitStore.getState().setOutfits(context.previousOutfits);
      }
      if (context?.previousDashboardOutfits) {
        useDashboardStore.getState().setOutfits(context.previousDashboardOutfits);
      }
      if (context?.previousQueryOutfits) {
        queryClient.setQueryData(['outfits', accessToken], context.previousQueryOutfits);
      }
      if (context?.previousDashboardQuery) {
        queryClient.setQueryData(['dashboard', accessToken], context.previousDashboardQuery);
      }

      showToast({ message: getNetworkErrorMessage(error), variant: 'destructive' });
    },
  });
}
