'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useFaceStudioStore } from '@/features/face-studio/store/useFaceStudioStore';
import { useCartStore } from '@/features/commerce/store/useCartStore';
import { useOrderStore } from '@/features/checkout/store/useOrderStore';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import { SessionIntegrity } from '@/components/layout/SessionIntegrity';
import { enforceSessionOwnership } from '@/features/auth/utils/sessionLifecycle';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    async function hydrateStores() {
      await Promise.all([
        useAuthStore.persist.rehydrate(),
        useProfileStore.persist.rehydrate(),
        useFaceStudioStore.persist.rehydrate(),
        useCartStore.persist.rehydrate(),
        useWishlistStore.persist.rehydrate(),
        useOrderStore.persist.rehydrate(),
      ]);

      enforceSessionOwnership();
    }

    void hydrateStores();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SessionIntegrity />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
