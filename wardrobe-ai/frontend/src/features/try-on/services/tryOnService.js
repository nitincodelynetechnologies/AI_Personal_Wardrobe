import { apiClient } from '@/features/auth/services/apiClient';

export async function requestVirtualTryOn(token, { productId, userId }) {
  return apiClient('/try-on', {
    method: 'POST',
    token,
    body: {
      product_id: productId,
      user_id: userId,
    },
    timeoutMs: 30000,
  });
}
