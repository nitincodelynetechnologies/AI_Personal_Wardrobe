import { resolveVtonApiBaseUrl } from '@/features/auth/utils/resolveApiBaseUrl';

function getVtonApiBase() {
  return resolveVtonApiBaseUrl();
}

const VTON_TIMEOUT_MS = 300000;

function isGpuCapacityError(message) {
  return /no gpu|gpu was|retry later|zerogpu|quota exceeded|hugging face.*busy|queue.*full|overloaded/i.test(
    message || '',
  );
}

export async function fetchVtonHealth() {
  try {
    const response = await fetch(`${getVtonApiBase()}/health`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.service === 'idm-vton' ? data : null;
  } catch {
    return null;
  }
}

function buildOfflineMockResult(userImageSource) {
  return {
    success: true,
    mock: true,
    backend_offline: true,
    fallback_reason:
      'VTON backend is offline — showing dev pairing. Start it: cd wardrobe-ai/vton-backend && .\\start.ps1',
    result_image_url: userImageSource,
  };
}

function isProxyOrBackendFailure(status, data) {
  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    (status === 500 && !data)
  );
}

/**
 * Convert image URL / data URI to File for multipart upload.
 */
export async function urlToFile(url, filename) {
  if (!url) {
    throw new Error('Image URL is required');
  }

  const response = await fetch(url, url.startsWith('data:') ? undefined : { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to load image (${response.status})`);
  }

  const blob = await response.blob();
  const type = blob.type || 'image/jpeg';
  return new File([blob], filename, { type });
}

/**
 * POST to Python IDM-VTON FastAPI backend (proxied through Next.js in dev).
 */
export async function requestIdmVton({ userImageSource, garmentImageSource, garmentDescription }) {
  const health = await fetchVtonHealth();
  if (!health) {
    return buildOfflineMockResult(userImageSource);
  }

  const [userFile, garmentFile] = await Promise.all([
    urlToFile(userImageSource, 'user.jpg'),
    urlToFile(garmentImageSource, 'garment.jpg'),
  ]);

  const formData = new FormData();
  formData.append('user_image', userFile);
  formData.append('garment_image', garmentFile);
  formData.append('garment_description', garmentDescription || 'A stylish garment');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VTON_TIMEOUT_MS);

  try {
    const response = await fetch(`${getVtonApiBase()}/api/try-on`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (isProxyOrBackendFailure(response.status, data)) {
        return buildOfflineMockResult(userImageSource);
      }

      const fallback =
        response.status === 500
          ? 'VTON proxy timed out — retry (real AI takes 2–5 min) or restart the Next dev server after config changes.'
          : null;
      throw new Error(data?.error || data?.detail || fallback || `VTON service error (${response.status})`);
    }

    if (!data?.success) {
      if (isGpuCapacityError(data?.error)) {
        return {
          success: true,
          mock: true,
          gpu_fallback: true,
          fallback_reason:
            'Hugging Face IDM-VTON has no free GPU right now. Showing dev pairing — retry later for real AI.',
          result_image_url: userImageSource,
        };
      }
      throw new Error(data?.error || `VTON request failed (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI try-on timed out. Please try again.');
    }
    if (error instanceof TypeError) {
      throw new Error(
        'Cannot reach the VTON AI service. Start it with: cd wardrobe-ai/vton-backend && .\\start.ps1',
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
