'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/features/auth/services/apiClient';
import { generateOutfit } from '@/features/outfits/services/outfitService';
import { useOutfitStore } from '@/features/outfits/store/useOutfitStore';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function useGenerateOutfit({ onSuccess, onError } = {}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addOutfit = useOutfitStore((state) => state.addOutfit);
  const addDashboardOutfit = useDashboardStore((state) => state.addOutfit);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => generateOutfit(accessToken, payload),
    onSuccess: (outfit) => {
      addOutfit(outfit);
      addDashboardOutfit(outfit);
      queryClient.setQueryData(['outfits', accessToken], (current) => {
        const existing = Array.isArray(current) ? current : [];
        return [outfit, ...existing.filter((item) => item.id !== outfit.id)];
      });
      queryClient.setQueryData(['dashboard', accessToken], (current) => {
        if (!current || typeof current !== 'object') return current;
        const existingOutfits = Array.isArray(current.outfits) ? current.outfits : [];
        return {
          ...current,
          outfits: [outfit, ...existingOutfits.filter((item) => item.id !== outfit.id)],
        };
      });
      onSuccess?.(outfit);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}

export function getGenerateOutfitErrorMessage(error) {
  if (error instanceof ApiError && error.status === 400) {
    return 'Upload more clothes first!';
  }

  return error?.message || 'Unable to generate outfit. Please try again.';
}
