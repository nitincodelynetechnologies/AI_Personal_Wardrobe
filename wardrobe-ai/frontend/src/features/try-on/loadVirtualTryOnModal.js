const RETRY_DELAY_MS = 1200;
const MAX_RETRIES = 3;

let preloadPromise = null;

function isChunkLoadError(error) {
  const message = error?.message ?? '';
  return (
    error?.name === 'ChunkLoadError' ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to fetch dynamically imported module')
  );
}

/**
 * Preload the try-on modal chunk during idle time so the first click is instant.
 */
export function preloadVirtualTryOnModal() {
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (!preloadPromise) {
    preloadPromise = loadVirtualTryOnModalComponent().catch((error) => {
      preloadPromise = null;
      throw error;
    });
  }

  return preloadPromise;
}

export function loadVirtualTryOnModalComponent(retriesLeft = MAX_RETRIES) {
  return import('@/features/try-on/components/VirtualTryOnModal')
    .then((mod) => mod.VirtualTryOnModal)
    .catch((error) => {
      if (!isChunkLoadError(error) || retriesLeft <= 0) {
        throw error;
      }

      preloadPromise = null;

      return new Promise((resolve) => {
        setTimeout(resolve, RETRY_DELAY_MS);
      }).then(() => loadVirtualTryOnModalComponent(retriesLeft - 1));
    });
}
