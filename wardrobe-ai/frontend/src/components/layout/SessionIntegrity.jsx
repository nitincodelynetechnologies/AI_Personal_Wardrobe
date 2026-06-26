'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { enforceSessionOwnership } from '@/features/auth/utils/sessionLifecycle';

export function SessionIntegrity() {
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    enforceSessionOwnership();
  }, [userId]);

  return null;
}
