'use client';

import { useMemo } from 'react';
import { computeAdminDashboardMetrics } from '@/features/admin/utils/adminDashboardAnalytics';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';

const EMPTY_METRICS = computeAdminDashboardMetrics([], []);

export function useAdminDashboardMetrics() {
  const { orders, registeredUsers, loading, dataSource, refresh } = useAdminOrders();

  const metrics = useMemo(() => {
    if (!orders.length) {
      return EMPTY_METRICS;
    }
    return computeAdminDashboardMetrics(orders, []);
  }, [orders]);

  const kpisWithRegisteredUsers = useMemo(() => {
    if (!registeredUsers) return metrics.kpis;

    return metrics.kpis.map((card) => {
      if (card.metricKey !== 'users') return card;
      return {
        ...card,
        value: registeredUsers.toLocaleString('en-IN'),
        caption: 'registered in database',
        trend: 'Live',
        trendUp: true,
      };
    });
  }, [metrics.kpis, registeredUsers]);

  return {
    ...metrics,
    kpis: kpisWithRegisteredUsers,
    loading,
    dataSource,
    refresh,
  };
}
