/** Same-origin proxy via Next.js rewrite → Python vton-backend (see next.config.js) */
const VTON_API_BASE = process.env.NEXT_PUBLIC_VTON_API_URL || '/vton-api';

const VTON_TIMEOUT_MS = 300000;

function isGpuCapacityError(message) {
  return /no gpu|gpu was|retry later|zerogpu|quota exceeded|hugging face.*busy|queue.*full|overloaded/i.test(
    message || '',
  );
}

export async function fetchVtonHealth() {
  try {
    const response = await fetch(`${VTON_API_BASE}/health`, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
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
    const response = await fetch(`${VTON_API_BASE}/api/try-on`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const fallback =
        response.status === 500 && !data
          ? 'VTON proxy timed out or failed — restart the Next dev server after config changes, or retry (real AI takes 2–5 min).'
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
