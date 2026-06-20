import { apiClient } from '@/features/auth/services/apiClient';

export async function fetchWardrobeItems(token) {
  const data = await apiClient('/wardrobe/items', { token });
  return data.items ?? [];
}

export async function uploadWardrobeItem({ token, file, metadata }) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('category', metadata.category);

  if (metadata.sub_category) {
    formData.append('sub_category', metadata.sub_category);
  }

  if (metadata.color_hex) {
    formData.append('color_hex', metadata.color_hex);
  }

  if (metadata.season) {
    formData.append('season', metadata.season);
  }

  return apiClient('/wardrobe/upload', {
    method: 'POST',
    token,
    body: formData,
  });
}

export async function deleteWardrobeItem(token, itemId) {
  return apiClient(`/wardrobe/items/${itemId}`, {
    method: 'DELETE',
    token,
  });
}
