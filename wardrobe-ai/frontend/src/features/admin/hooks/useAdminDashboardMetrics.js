'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADMIN_ORDERS_UPDATED } from '@/features/admin/storage/adminStorage';
import { GLOBAL_CATALOG_UPDATED_EVENT } from '@/features/catalog/utils/globalCatalogStorage';
import { PRODUCTS_KEY, computeAdminDashboardMetrics } from '@/features/admin/utils/adminDashboardAnalytics';
import { readOrdersRaw } from '@/features/shared/storage/platformSyncStorage';

const EMPTY_METRICS = computeAdminDashboardMetrics([], []);

export function useAdminDashboardMetrics() {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);

  const refresh = useCallback(() => {
    setMetrics(computeAdminDashboardMetrics(readOrdersRaw()));
  }, []);

  useEffect(() => {
    refresh();

    const onStorage = (event) => {
      if (
        !event.key ||
        event.key === 'vton_orders' ||
        event.key === PRODUCTS_KEY ||
        event.key === 'vton_global_catalog'
      ) {
        refresh();
      }
    };

    window.addEventListener(ADMIN_ORDERS_UPDATED, refresh);
    window.addEventListener('vton-orders-updated', refresh);
    window.addEventListener(GLOBAL_CATALOG_UPDATED_EVENT, refresh);
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(refresh, 3000);

    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED, refresh);
      window.removeEventListener('vton-orders-updated', refresh);
      window.removeEventListener(GLOBAL_CATALOG_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return { ...metrics, refresh };
}
