'use client';

import { useEffect, useState } from 'react';
import { hasVtonUserProfile } from '@/features/auth/utils/premiumAccess';
import { rehydrateAuthStores } from '@/features/profile/utils/profileSync';

/**
 * Client-only guest detection after persisted auth stores rehydrate.
 * Guests have no `vton_user` profile and no active wardrobe-auth session.
 */
export function useGuestAccess() {
  const [state, setState] = useState({ ready: false, isGuest: true });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await rehydrateAuthStores();
      if (!cancelled) {
        setState({ ready: true, isGuest: !hasVtonUserProfile() });
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
