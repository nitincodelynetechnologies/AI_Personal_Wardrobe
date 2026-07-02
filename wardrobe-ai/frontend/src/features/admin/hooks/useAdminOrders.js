'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminStats } from '@/features/admin/services/adminService';
import { getSessionToken } from '@/features/auth/utils/sessionToken';
import { normalizePlatformOrder } from '@/features/shared/storage/platformSyncStorage';

const ADMIN_REFRESH_MS = 5000;

export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('api');

  const refresh = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError('Not authenticated');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchAdminStats(token);
      const apiOrders = (data.orders ?? []).map(normalizePlatformOrder).filter(Boolean);
      setOrders(apiOrders);
      setRegisteredUsers(Number(data.registeredUsers) || 0);
      setDataSource('api');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admin orders';
      setError(message);
      console.error('[useAdminOrders] API fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, ADMIN_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return {
    orders,
    registeredUsers,
    loading,
    error,
    dataSource,
    refresh,
  };
}
