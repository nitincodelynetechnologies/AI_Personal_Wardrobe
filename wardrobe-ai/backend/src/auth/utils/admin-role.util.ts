import { PublicUser } from '../../users/interfaces/user.interface';

const DEFAULT_ADMIN_EMAILS = ['patel12@gmail.com', 'patel@gmail.com'];

export function parseAdminEmailAllowlist(raw?: string): string[] {
  const source = raw?.trim()
    ? raw.split(',')
    : DEFAULT_ADMIN_EMAILS;

  return source
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | null | undefined,
  allowlist: string[],
): boolean {
  if (!email) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export function withAdminRole(
  user: PublicUser,
  allowlist: string[],
): PublicUser {
  if (isAdminEmail(user.email, allowlist)) {
    return { ...user, role: 'admin' };
  }

  return user;
}
