'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
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
    useAuthStore.persist.rehydrate();
    useProfileStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
