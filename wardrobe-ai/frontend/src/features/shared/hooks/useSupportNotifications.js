'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getUnreadOrderUpdateCount,
  getUnreadOrderUpdatesForEmail,
  getUnreadTicketCount,
  getUnreadTicketsForEmail,
  markOrderUpdatesReadForEmail,
  markTicketsReadForEmail,
  ORDERS_UPDATED,
  readOrdersForEmail,
  readTicketsForEmail,
  TICKETS_UPDATED,
} from '@/features/shared/storage/platformSyncStorage';
import { useUserAccountEmail } from '@/features/shared/hooks/useUserAccountEmail';

export function useSupportNotifications() {
  const email = useUserAccountEmail();
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);
  const [unreadTickets, setUnreadTickets] = useState([]);
  const [unreadOrders, setUnreadOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);

  const refresh = useCallback(() => {
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
    setUnreadOrderCount(getUnreadOrderUpdateCount(email));
    setUnreadTickets(getUnreadTicketsForEmail(email));
    setUnreadOrders(getUnreadOrderUpdatesForEmail(email));
    setTickets(readTicketsForEmail(email));
    setOrders(readOrdersForEmail(email));
  }, [email]);

  useEffect(() => {
    refresh();

    const onStorage = (event) => {
      if (
        event.key === 'vton_tickets' ||
        event.key === 'vton_orders' ||
        event.key === null
      ) {
        refresh();
      }
    };

    window.addEventListener(TICKETS_UPDATED, refresh);
    window.addEventListener(ORDERS_UPDATED, refresh);
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(refresh, 3000);

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
    refresh();
  }, [email, refresh]);

  const markAllOrderUpdatesRead = useCallback(() => {
    if (!email) return;
    markOrderUpdatesReadForEmail(email);
    refresh();
  }, [email, refresh]);

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
