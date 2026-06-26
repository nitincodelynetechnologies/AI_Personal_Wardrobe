import { apiClient } from '@/features/auth/services/apiClient';

export async function sendStylistChatMessage(message, { token } = {}) {
  return apiClient('/chat', {
    method: 'POST',
    body: { message },
    token,
    timeoutMs: 30000,
  });
}
