function inferRenderBackendApiUrl(hostname) {
  if (!hostname.endsWith('.onrender.com')) {
    return null;
  }

  // e.g. ai-personal-wardrobe-1.onrender.com -> ai-personal-wardrobe.onrender.com
  const match = hostname.match(/^(.+?)(?:-\d+)\.onrender\.com$/);
  if (!match) {
    return null;
  }

  return `https://${match[1]}.onrender.com/api`;
}

export function getApiBaseUrl() {
  const configured = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

  if (configured.startsWith('http')) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const inferred = inferRenderBackendApiUrl(window.location.hostname);
    if (inferred) {
      return inferred;
    }
  }

  return configured || '/api';
}

export const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Check your network and ensure the API is running.';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getNetworkErrorMessage(error) {
  if (!error) return NETWORK_ERROR_MESSAGE;

  if (error instanceof ApiError && error.status === 0) {
    return error.message;
  }

  if (error instanceof ApiError && error.status === 503) {
    return error.message;
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'Server error while saving your profile. Ensure Docker is running (postgres + qdrant), then try again.';
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return NETWORK_ERROR_MESSAGE;
  }

  return error.message || NETWORK_ERROR_MESSAGE;
}

export async function apiClient(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, token, timeoutMs } = options;
  const apiBaseUrl = getApiBaseUrl();

  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const controller = timeoutMs ? new AbortController() : null;
  const timeoutId =
    controller &&
    setTimeout(() => {
      controller.abort();
    }, timeoutMs);

  let response;

  try {
    response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller?.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 0, null);
    }
    throw new ApiError(getNetworkErrorMessage(error), 0, null);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType?.includes('application/json')) {
    const raw = await response.text();
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new ApiError(
        'Server returned an invalid response. Try again in a moment.',
        response.status,
        raw.slice(0, 200),
      );
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}
