import { getApiBaseUrl } from '@/features/auth/services/apiClient';

/**
 * Resolves `/uploads/...` paths served by the NestJS backend (not under `/api`).
 */
export function resolveBackendAssetUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  return `${origin}${normalizedPath}`;
}
