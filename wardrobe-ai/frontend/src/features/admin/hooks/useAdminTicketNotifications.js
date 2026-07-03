'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ADMIN_TICKETS_UPDATED,
  getAdminUnreadTicketCount,
} from '@/features/admin/storage/adminCrmStorage';
import { getSessionToken } from '@/features/auth/utils/sessionToken';
import { fetchAdminSupportUnreadCount } from '@/features/support/services/supportApiService';
import {
  connectSupportSocket,
} from '@/features/support/services/supportSocket';

export function useAdminTicketNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    const token = getSessionToken();

    if (token) {
      try {
        const data = await fetchAdminSupportUnreadCount(token);
        setUnreadCount(Number(data.count) || 0);
        return;
      } catch (error) {
        console.warn('[useAdminTicketNotifications] API unread count failed:', error);
      }
    }

    setUnreadCount(getAdminUnreadTicketCount());
  }, []);

  useEffect(() => {
    void refresh();

    const token = getSessionToken();
    void connectSupportSocket({
      role: 'admin',
      token,
      handlers: {
        onTicket: () => {
          void refresh();
        },
        onHandoff: () => {
          void refresh();
          window.dispatchEvent(new CustomEvent(ADMIN_TICKETS_UPDATED));
        },
      },
    });

    const onStorage = (event) => {
      if (event.key === 'vton_tickets' || event.key === null) void refresh();
    };

    window.addEventListener(ADMIN_TICKETS_UPDATED, refresh);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(ADMIN_TICKETS_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return { unreadCount, refresh };
}
