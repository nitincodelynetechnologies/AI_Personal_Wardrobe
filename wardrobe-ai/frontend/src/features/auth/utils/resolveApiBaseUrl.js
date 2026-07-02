const LOCAL_API_FALLBACK = '/api';

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, '');
}

function isAbsoluteUrl(value) {
  return value.startsWith('http://') || value.startsWith('https://');
}

function readConfiguredApiUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
  ];

  for (const raw of candidates) {
    const trimmed = (raw || '').trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return '';
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Render often names the frontend `*-1` and the API without the suffix.
 * e.g. ai-personal-wardrobe-1.onrender.com → ai-personal-wardrobe.onrender.com/api
 */
export function inferRenderBackendApiUrl(hostname) {
  if (!hostname.endsWith('.onrender.com')) {
    return null;
  }

  const numbered = hostname.match(/^(.+?)-(\d+)\.onrender\.com$/);
  if (numbered) {
    return `https://${numbered[1]}.onrender.com/api`;
  }

  return null;
}

/**
 * Browser-side API base URL for the NestJS wardrobe backend.
 *
 * - Local dev: `/api` (Next.js rewrite or route handler → localhost:3001).
 * - Production / static export (`out/`): absolute backend URL — rewrites and `/api` routes do not exist.
 */
export function resolveApiBaseUrl() {
  const configured = readConfiguredApiUrl();

  if (isAbsoluteUrl(configured)) {
    return normalizeBaseUrl(configured);
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (!isLocalHostname(hostname)) {
      const inferred = inferRenderBackendApiUrl(hostname);
      if (inferred) {
        return inferred;
      }

      if (configured === '/api' || !configured) {
        console.error(
          '[Wardrobe API] Static/production deploy detected without an absolute backend URL. ' +
            'Set NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api before building.',
        );
      }
    }
  }

  return configured || LOCAL_API_FALLBACK;
}

/**
 * VTON Python service — same-origin `/vton-api` only works with a Next.js server (not static export).
 */
export function resolveVtonApiBaseUrl() {
  const configured = (process.env.NEXT_PUBLIC_VTON_API_URL || '').trim();
  const directBackend = (process.env.NEXT_PUBLIC_VTON_BACKEND_URL || '').trim();

  if (isAbsoluteUrl(configured)) {
    return normalizeBaseUrl(configured);
  }

  if (isAbsoluteUrl(directBackend)) {
    return normalizeBaseUrl(directBackend);
  }

  if (typeof window !== 'undefined' && !isLocalHostname(window.location.hostname)) {
    console.warn(
      '[VTON] NEXT_PUBLIC_VTON_API_URL must be an absolute URL in production/static export, ' +
        'or set NEXT_PUBLIC_VTON_BACKEND_URL.',
    );
  }

  return configured || '/vton-api';
}
