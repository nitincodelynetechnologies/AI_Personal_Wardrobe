'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchUserOrders } from '@/features/orders/services/orderApiService';
import { getSessionToken } from '@/features/auth/utils/sessionToken';
import {
  applyOrderReadState,
  markOrdersSeenForUser,
} from '@/features/orders/utils/orderReadState';
import {
  normalizePlatformOrder,
  ORDERS_UPDATED,
} from '@/features/shared/storage/platformSyncStorage';

const USER_ORDERS_REFRESH_MS = 8000;

export function useUserOrders({ enabled = true, poll = true } = {}) {
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && isAuthenticated));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const token = getSessionToken();

    if (!enabled || !isAuthenticated || !userId || !token) {
      setOrders([]);
      setError(null);
      setLoading(false);
      return [];
    }

    try {
      const data = await fetchUserOrders(token);
      const apiOrders = (data.orders ?? [])
        .map(normalizePlatformOrder)
        .filter(Boolean)
        .map((order) => applyOrderReadState(userId, order));

      setOrders(apiOrders);
      setError(null);

      return apiOrders;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
      setOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userId]);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !userId) {
      setOrders([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    void refresh();

    if (!poll) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void refresh();
    }, USER_ORDERS_REFRESH_MS);

    const onOrdersUpdated = () => {
      void refresh();
    };

    window.addEventListener(ORDERS_UPDATED, onOrdersUpdated);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(ORDERS_UPDATED, onOrdersUpdated);
    };
  }, [enabled, isAuthenticated, userId, poll, refresh]);

  const markAllRead = useCallback(() => {
    if (!userId) return;
    setOrders((current) => {
      markOrdersSeenForUser(userId, current);
      return current.map((order) => ({ ...order, userUnreadUpdate: false }));
    });
  }, [userId]);

  return {
    orders,
    loading,
    error,
    refresh,
    markAllRead,
  };
}
