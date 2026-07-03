'use client';

import { useCallback, useEffect, useState } from 'react';
import { deleteAdminUser, fetchAdminUsers } from '@/features/admin/services/adminService';
import { getSessionToken } from '@/features/auth/utils/sessionToken';

const ADMIN_USERS_REFRESH_MS = 5000;

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const refresh = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError('Not authenticated');
      setUsers([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchAdminUsers(token);
      setUsers(data.users ?? []);
      setTotal(Number(data.total) || 0);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load registered users';
      setError(message);
      console.error('[useAdminUsers] API fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(
    async (userId) => {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      setDeletingUserId(userId);
      try {
        await deleteAdminUser(userId, token);
        await refresh();
      } finally {
        setDeletingUserId(null);
      }
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, ADMIN_USERS_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return {
    users,
    total,
    loading,
    error,
    deletingUserId,
    refresh,
    removeUser,
  };
}
