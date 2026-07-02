const ADMIN_ROLES = new Set(['admin', 'ADMIN', 'superadmin']);

/** Built-in admin emails — works without NEXT_PUBLIC rebuild on Render. */
const DEFAULT_ADMIN_EMAILS = ['patel12@gmail.com', 'patel@gmail.com'];

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function getAdminEmailAllowlist() {
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return fromEnv.length ? fromEnv : DEFAULT_ADMIN_EMAILS;
}

/**
 * Returns true when the signed-in user has admin privileges.
 * Safe to call with null/undefined user.
 */
export function isAdminUser(user) {
  if (!user) return false;

  const role = user.role ?? user.user_role;
  if (role && ADMIN_ROLES.has(role)) {
    return true;
  }

  const email = normalizeEmail(user.email);
  if (!email) return false;

  return getAdminEmailAllowlist().includes(email);
}
