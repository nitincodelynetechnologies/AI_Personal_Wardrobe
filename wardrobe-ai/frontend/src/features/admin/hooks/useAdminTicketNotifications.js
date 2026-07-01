'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ADMIN_TICKETS_UPDATED,
  getAdminUnreadTicketCount,
} from '@/features/admin/storage/adminCrmStorage';

export function useAdminTicketNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    setUnreadCount(getAdminUnreadTicketCount());
  }, []);

  useEffect(() => {
    refresh();

    const onStorage = (event) => {
      if (event.key === 'vton_tickets' || event.key === null) refresh();
    };

    window.addEventListener(ADMIN_TICKETS_UPDATED, refresh);
    window.addEventListener('storage', onStorage);

    const interval = window.setInterval(refresh, 3000);

    return () => {
      window.removeEventListener(ADMIN_TICKETS_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return { unreadCount, refresh };
}
