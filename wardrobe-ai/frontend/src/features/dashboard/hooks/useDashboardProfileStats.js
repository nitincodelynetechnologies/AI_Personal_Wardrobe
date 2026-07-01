'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWishlistStore } from '@/features/commerce/store/useWishlistStore';
import {
  PROFILE_STATS_REFRESH_EVENTS,
  readDashboardProfileStats,
} from '@/features/dashboard/utils/dashboardProfileStats';

const INITIAL_STATS = {
  outfitsSaved: 0,
  tryOnsDone: 0,
  wardrobeItems: 0,
  ordersPlaced: 0,
};

export function useDashboardProfileStats() {
  const [stats, setStats] = useState(INITIAL_STATS);

  const refresh = useCallback(() => {
    setStats(readDashboardProfileStats());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    refresh();

    const handleRefresh = () => refresh();

    PROFILE_STATS_REFRESH_EVENTS.filter(Boolean).forEach((eventName) => {
      window.addEventListener(eventName, handleRefresh);
    });

    window.addEventListener('focus', handleRefresh);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleRefresh);
    }

    const unsubscribeWishlist = useWishlistStore.subscribe(() => {
      refresh();
    });

    return () => {
      PROFILE_STATS_REFRESH_EVENTS.filter(Boolean).forEach((eventName) => {
        window.removeEventListener(eventName, handleRefresh);
      });
      window.removeEventListener('focus', handleRefresh);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleRefresh);
      }
      unsubscribeWishlist();
    };
  }, [refresh]);

  return stats;
}
