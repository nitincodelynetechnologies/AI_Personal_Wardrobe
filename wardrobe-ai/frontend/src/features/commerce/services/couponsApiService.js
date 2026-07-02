import { getApiBaseUrl, ApiError } from '@/features/auth/services/apiClient';
import { getSessionToken } from '@/features/auth/utils/sessionToken';

async function couponsFetch(endpoint, options = {}) {
  const { method = 'GET', body, token, auth = false } = options;
  const accessToken = auth ? (token ?? getSessionToken()) : token;

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
      throw new ApiError('Invalid coupon API response', response.status, raw?.slice(0, 200));
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
        : `Coupon request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

/** Public — active offer for all users (no auth). */
export function fetchActiveCoupon() {
  return couponsFetch('/coupons/active');
}

export function fetchAdminCoupons(token) {
  return couponsFetch('/admin/coupons', { token, auth: true });
}

export function createAdminCoupon(payload, token) {
  return couponsFetch('/admin/coupons', {
    method: 'POST',
    body: payload,
    token,
    auth: true,
  });
}

export function updateAdminCouponStatus(couponId, status, token) {
  return couponsFetch(`/admin/coupons/${couponId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
    auth: true,
  });
}
