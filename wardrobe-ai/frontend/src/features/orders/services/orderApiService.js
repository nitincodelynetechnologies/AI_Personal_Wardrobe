import { apiClient } from '@/features/auth/services/apiClient';
import { getSessionToken } from '@/features/auth/utils/sessionToken';

export async function createOrderOnServer(payload) {
  const token = getSessionToken();
  if (!token) {
    throw new Error('You must be logged in to place an order.');
  }

  return apiClient('/orders', {
    method: 'POST',
    body: payload,
    token,
    cache: 'no-store',
  });
}

/** Fetches order history for the signed-in user (scoped by JWT user id on the server). */
export async function fetchUserOrders(token = getSessionToken()) {
  if (!token) {
    throw new Error('You must be logged in to view order history.');
  }

  return apiClient('/orders', {
    method: 'GET',
    token,
    cache: 'no-store',
  });
}
