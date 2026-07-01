export const VTON_USER_KEY = 'vton_user';
const AUTH_STORAGE_KEY = 'wardrobe-auth';

function parseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** True when a signed-in profile exists (`vton_user` or persisted auth session). */
export function hasVtonUserProfile() {
  if (typeof window === 'undefined') return false;

  const vtonUser = parseJson(localStorage.getItem(VTON_USER_KEY));
  if (vtonUser && (vtonUser.id || vtonUser.email || vtonUser.user_id)) {
    return true;
  }

  const auth = parseJson(localStorage.getItem(AUTH_STORAGE_KEY));
  const state = auth?.state ?? auth;
  return Boolean(state?.isAuthenticated && (state?.accessToken || state?.user));
}

export function isGuestBrowser() {
  return !hasVtonUserProfile();
}
