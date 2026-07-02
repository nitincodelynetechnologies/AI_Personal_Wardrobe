import { getApiBaseUrl, ApiError } from '@/features/auth/services/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

async function adminFetch(endpoint, options = {}) {
  const { method = 'GET', body, token } = options;
  const accessToken = token ?? useAuthStore.getState().accessToken;

  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType?.includes('application/json')) {
    const raw = await response.text();
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new ApiError('Admin API returned invalid JSON', response.status, raw?.slice(0, 200));
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
        : `Admin request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export function fetchAdminStats(token) {
  return adminFetch('/admin/stats', { token });
}

export function fetchAdminOrders(token) {
  return adminFetch('/admin/orders', { token });
}

export function updateAdminOrderStatus(orderId, status, token) {
  return adminFetch(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  });
}

export function createOrderOnServer(payload, token) {
  return adminFetch('/orders', {
    method: 'POST',
    body: payload,
    token,
  });
}
