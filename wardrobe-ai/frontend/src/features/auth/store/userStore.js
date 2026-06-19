/**
 * User session store — primary export for auth/user global state.
 * Implemented via Zustand persist (localStorage). See useAuthStore for the store definition.
 */
export { useAuthStore as useUserStore } from '@/features/auth/store/useAuthStore';
