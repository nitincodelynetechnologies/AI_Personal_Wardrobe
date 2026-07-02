'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getUnreadTicketCount,
  getUnreadTicketsForEmail,
  markTicketsReadForEmail,
  normalizePlatformOrder,
  ORDERS_UPDATED,
  readTicketsForEmail,
  TICKETS_UPDATED,
} from '@/features/shared/storage/platformSyncStorage';
import { useUserAccountEmail } from '@/features/shared/hooks/useUserAccountEmail';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchUserOrders } from '@/features/orders/services/orderApiService';
import { getSessionToken } from '@/features/auth/utils/sessionToken';
import {
  applyOrderReadState,
  getUnreadOrdersForUser,
  markOrdersSeenForUser,
} from '@/features/orders/utils/orderReadState';

export function useSupportNotifications() {
  const email = useUserAccountEmail();
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);
  const [unreadTickets, setUnreadTickets] = useState([]);
  const [unreadOrders, setUnreadOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);

  const refresh = useCallback(async () => {
    if (!email) {
      setUnreadTicketCount(0);
      setUnreadOrderCount(0);
      setUnreadTickets([]);
      setUnreadOrders([]);
      setTickets([]);
      setOrders([]);
      return;
    }

    setUnreadTicketCount(getUnreadTicketCount(email));
    setUnreadTickets(getUnreadTicketsForEmail(email));
    setTickets(readTicketsForEmail(email));

    if (!isAuthenticated || !userId) {
      setUnreadOrderCount(0);
      setUnreadOrders([]);
      setOrders([]);
      return;
    }

    const token = getSessionToken();
    if (!token) {
      setUnreadOrderCount(0);
      setUnreadOrders([]);
      setOrders([]);
      return;
    }

    try {
      const data = await fetchUserOrders(token);
      const apiOrders = (data.orders ?? [])
        .map(normalizePlatformOrder)
        .filter(Boolean)
        .map((order) => applyOrderReadState(userId, order));

      const unread = getUnreadOrdersForUser(userId, apiOrders);
      setOrders(apiOrders);
      setUnreadOrders(unread);
      setUnreadOrderCount(unread.length);
    } catch {
      setUnreadOrderCount(0);
      setUnreadOrders([]);
      setOrders([]);
    }
  }, [email, isAuthenticated, userId]);

  useEffect(() => {
    void refresh();

    const onStorage = (event) => {
      if (
        event.key === 'vton_tickets' ||
        event.key === 'vton_orders' ||
        event.key === null
      ) {
        void refresh();
      }
    };

    window.addEventListener(TICKETS_UPDATED, refresh);
    window.addEventListener(ORDERS_UPDATED, refresh);
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(() => {
      void refresh();
    }, 8000);

    return () => {
      window.removeEventListener(TICKETS_UPDATED, refresh);
      window.removeEventListener(ORDERS_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const unreadCount = useMemo(
    () => unreadTicketCount + unreadOrderCount,
    [unreadTicketCount, unreadOrderCount],
  );

  const markAllRead = useCallback(() => {
    if (!email) return;
    markTicketsReadForEmail(email);
    void refresh();
  }, [email, refresh]);

  const markAllOrderUpdatesRead = useCallback(() => {
    if (!userId) return;
    markOrdersSeenForUser(userId, orders);
    void refresh();
  }, [orders, refresh, userId]);

  return {
    email,
    unreadCount,
    unreadTicketCount,
    unreadOrderCount,
    unreadTickets,
    unreadOrders,
    tickets,
    orders,
    refresh,
    markAllRead,
    markAllOrderUpdatesRead,
  };
}
