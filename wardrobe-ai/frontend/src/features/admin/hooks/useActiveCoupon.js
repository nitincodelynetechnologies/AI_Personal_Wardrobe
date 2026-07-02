'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchActiveCoupon } from '@/features/commerce/services/couponsApiService';
import {
  ADMIN_COUPONS_UPDATED,
  getActiveCoupon as getLocalActiveCoupon,
} from '@/features/admin/storage/adminStorage';

const COUPON_POLL_MS = 8000;

export function useActiveCoupon() {
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [source, setSource] = useState('api');

  const refresh = useCallback(async () => {
    try {
      const data = await fetchActiveCoupon();
      setActiveCoupon(data?.coupon ?? null);
      setSource('api');
    } catch (error) {
      console.warn('[useActiveCoupon] API fetch failed, using local fallback:', error);
      setActiveCoupon(getLocalActiveCoupon());
      setSource('local');
    }
  }, []);

  useEffect(() => {
    refresh();

    const onCustom = () => {
      refresh();
    };

    window.addEventListener(ADMIN_COUPONS_UPDATED, onCustom);
    const interval = window.setInterval(refresh, COUPON_POLL_MS);

    return () => {
      window.removeEventListener(ADMIN_COUPONS_UPDATED, onCustom);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return { activeCoupon, source, refresh };
}
