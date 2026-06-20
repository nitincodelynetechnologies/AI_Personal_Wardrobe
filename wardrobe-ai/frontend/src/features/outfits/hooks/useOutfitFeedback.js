'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, getNetworkErrorMessage } from '@/features/auth/services/apiClient';
import { useToastStore } from '@/components/ui/toaster';
import { submitOutfitFeedback } from '@/features/outfits/services/outfitService';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function buildFeedbackPatch(isFavorite) {
  return {
    is_favorite: isFavorite,
    feedback: isFavorite ? 'like' : 'dislike',
  };
}

function mergeOutfitFeedback(outfit, patch) {
  return outfit?.id ? { ...outfit, ...patch } : outfit;
}

function updateOutfitInList(list, outfitId, patch) {
  if (!Array.isArray(list)) return list;
  return list.map((outfit) => (outfit.id === outfitId ? { ...outfit, ...patch } : outfit));
}

export function useOutfitFeedback() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateOutfit = useOutfitStore((state) => state.updateOutfit);
  const updateOutfitInCache = useDashboardStore((state) => state.updateOutfitInCache);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ outfitId, isFavorite }) => {
      if (!accessToken) {
        throw new ApiError('You must be signed in to save feedback.', 401);
      }
      return submitOutfitFeedback(accessToken, outfitId, isFavorite);
    },
    onMutate: ({ outfitId, isFavorite }) => {
      const patch = buildFeedbackPatch(isFavorite);
      const previousOutfit = useOutfitStore.getState().outfits.find((item) => item.id === outfitId);
      const previousQueryOutfits = queryClient.getQueryData(['outfits', accessToken]);
      const previousDashboardQuery = queryClient.getQueryData(['dashboard', accessToken]);

      updateOutfit(outfitId, patch);
      updateOutfitInCache(outfitId, patch);
      queryClient.setQueryData(['outfits', accessToken], (current) =>
        updateOutfitInList(current, outfitId, patch),
      );
      queryClient.setQueryData(['dashboard', accessToken], (current) => {
        if (!current || typeof current !== 'object') return current;
        return {
          ...current,
          outfits: updateOutfitInList(current.outfits, outfitId, patch),
        };
      });

      return { previousOutfit, previousQueryOutfits, previousDashboardQuery };
    },
    onError: (_error, variables, context) => {
      if (context?.previousOutfit) {
        updateOutfit(variables.outfitId, context.previousOutfit);
        updateOutfitInCache(variables.outfitId, context.previousOutfit);
      } else {
        const neutralPatch = { is_favorite: false, feedback: null };
        updateOutfit(variables.outfitId, neutralPatch);
        updateOutfitInCache(variables.outfitId, neutralPatch);
      }

      if (context?.previousQueryOutfits) {
        queryClient.setQueryData(['outfits', accessToken], context.previousQueryOutfits);
      }
      if (context?.previousDashboardQuery) {
        queryClient.setQueryData(['dashboard', accessToken], context.previousDashboardQuery);
      }

      showToast({
        message: getNetworkErrorMessage(error),
        variant: 'destructive',
      });
    },
    onSuccess: (outfit, variables) => {
      const patch = buildFeedbackPatch(variables.isFavorite);
      const merged = mergeOutfitFeedback(outfit, patch);

      updateOutfit(outfit.id, merged);
      updateOutfitInCache(outfit.id, merged);
      queryClient.setQueryData(['outfits', accessToken], (current) =>
        updateOutfitInList(current, outfit.id, merged),
      );
      queryClient.setQueryData(['dashboard', accessToken], (current) => {
        if (!current || typeof current !== 'object') return current;
        return {
          ...current,
          outfits: updateOutfitInList(current.outfits, outfit.id, merged),
        };
      });
    },
  });
}
