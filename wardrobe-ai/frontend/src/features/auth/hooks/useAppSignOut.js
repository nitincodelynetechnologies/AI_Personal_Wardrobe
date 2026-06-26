'use client';



import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { clearUserSession } from '@/features/auth/utils/sessionLifecycle';



export function useAppSignOut() {

  const router = useRouter();

  const queryClient = useQueryClient();



  return useCallback(async () => {

    await clearUserSession();

    queryClient.clear();

    router.push('/');

  }, [router, queryClient]);

}

