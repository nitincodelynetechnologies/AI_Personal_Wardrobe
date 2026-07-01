'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ADMIN_COUPONS_UPDATED,
  COUPONS_KEY,
  getActiveCoupon,
} from '@/features/admin/storage/adminStorage';

export function useActiveCoupon() {
  const [activeCoupon, setActiveCoupon] = useState(null);

  const refresh = useCallback(() => {
    setActiveCoupon(getActiveCoupon());
  }, []);

  useEffect(() => {
    refresh();

    const onStorage = (event) => {
      if (!event.key || event.key === COUPONS_KEY) refresh();
    };

    window.addEventListener(ADMIN_COUPONS_UPDATED, refresh);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(ADMIN_COUPONS_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return activeCoupon;
}
