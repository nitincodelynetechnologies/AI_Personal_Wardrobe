'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchAdminStats } from '@/features/admin/services/adminService';
import { ADMIN_ORDERS_UPDATED } from '@/features/admin/storage/adminStorage';
import { normalizePlatformOrder, readOrdersRaw } from '@/features/shared/storage/platformSyncStorage';

const ADMIN_REFRESH_MS = 5000;

export function useAdminOrders() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [orders, setOrders] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local');

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setOrders(readOrdersRaw());
      setRegisteredUsers(0);
      setDataSource('local');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchAdminStats(accessToken);
      const apiOrders = (data.orders ?? []).map(normalizePlatformOrder).filter(Boolean);
      setOrders(apiOrders);
      setRegisteredUsers(Number(data.registeredUsers) || 0);
      setDataSource('api');
    } catch {
      const localOrders = readOrdersRaw();
      setOrders(localOrders);
      setRegisteredUsers(0);
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();

    const onStorage = (event) => {
      if (!event.key || event.key === 'vton_orders') {
        refresh();
      }
    };

    window.addEventListener(ADMIN_ORDERS_UPDATED, refresh);
    window.addEventListener('vton-orders-updated', refresh);
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(refresh, ADMIN_REFRESH_MS);

    return () => {
      window.removeEventListener(ADMIN_ORDERS_UPDATED, refresh);
      window.removeEventListener('vton-orders-updated', refresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return {
    orders,
    registeredUsers,
    loading,
    dataSource,
    refresh,
  };
}
