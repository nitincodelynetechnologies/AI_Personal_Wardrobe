import { ApiError, apiClient } from '@/features/auth/services/apiClient';

function assertOutfitId(outfitId) {
  if (!outfitId || typeof outfitId !== 'string') {
    throw new ApiError('Outfit ID is missing. Refresh the page and try again.', 400);
  }

  const normalized = outfitId.trim();
  if (!normalized) {
    throw new ApiError('Outfit ID is missing. Refresh the page and try again.', 400);
  }

  return normalized;
}

function authHeaders(token) {
  if (!token) {
    throw new ApiError('You must be signed in to manage outfits.', 401);
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchOutfits(token) {
  const data = await apiClient('/outfits', {
    token,
    headers: authHeaders(token),
  });
  return data.outfits ?? [];
}

export async function generateOutfit(token, payload = {}) {
  const data = await apiClient('/outfits/generate', {
    method: 'POST',
    token,
    headers: authHeaders(token),
    body: payload,
  });
  return data.outfit;
}

export async function submitOutfitFeedback(token, outfitId, isFavorite) {
  const id = assertOutfitId(outfitId);
  console.log('Sending outfit feedback ID:', id, 'is_favorite:', isFavorite);

  const data = await apiClient(`/outfits/${encodeURIComponent(id)}/feedback`, {
    method: 'PUT',
    token,
    headers: authHeaders(token),
    body: { is_favorite: Boolean(isFavorite) },
  });

  return data.outfit;
}

export async function deleteOutfit(token, outfitId) {
  const id = assertOutfitId(outfitId);
  console.log('Sending outfit delete ID:', id);

  return apiClient(`/outfits/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
    headers: authHeaders(token),
  });
}
