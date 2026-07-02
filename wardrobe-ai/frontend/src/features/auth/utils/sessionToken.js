import { useAuthStore } from '@/features/auth/store/useAuthStore';

/** JWT used for API calls — supports accessToken and legacy routingToken. */
export function getSessionToken() {
  const { accessToken, routingToken } = useAuthStore.getState();
  return accessToken ?? routingToken ?? null;
}
