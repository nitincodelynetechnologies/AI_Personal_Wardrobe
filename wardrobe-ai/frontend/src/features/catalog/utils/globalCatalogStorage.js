export const GLOBAL_CATALOG_KEY = 'vton_global_catalog';
export const GLOBAL_CATALOG_UPDATED_EVENT = 'vton-global-catalog-updated';

export const ADMIN_GARMENT_CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Dresses'];

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'Tops',
  imageUrl: '',
};

function safeRead(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function parseCatalog(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeGarment(garment) {
  if (!garment || typeof garment !== 'object') return null;

  const imageUrl = (garment.imageUrl ?? garment.image_url ?? '').trim();
  const name = (garment.name ?? '').trim();
  if (!name || !imageUrl) return null;

  return {
    id: garment.id ?? Date.now(),
    name,
    price: Number(garment.price) || 0,
    category: ADMIN_GARMENT_CATEGORIES.includes(garment.category) ? garment.category : 'Tops',
    imageUrl,
  };
}

function dispatchCatalogUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GLOBAL_CATALOG_UPDATED_EVENT));
}

/** Admin-added garments only (localStorage). */
export function readGlobalCatalog() {
  return parseCatalog(safeRead(GLOBAL_CATALOG_KEY))
    .map(normalizeGarment)
    .filter(Boolean);
}

/** @deprecated Use readGlobalCatalog — admin items only */
export function getGlobalCatalogForDisplay() {
  return readGlobalCatalog();
}

export function writeGlobalCatalog(garments) {
  const normalized = garments.map(normalizeGarment).filter(Boolean);
  const ok = safeWrite(GLOBAL_CATALOG_KEY, JSON.stringify(normalized));
  if (ok) dispatchCatalogUpdated();
  return { ok, garments: normalized };
}

export function createGlobalCatalogGarment(garment) {
  const normalized = normalizeGarment({ ...garment, id: garment.id ?? Date.now() });
  if (!normalized) throw new Error('Invalid garment data');

  const next = [...readGlobalCatalog(), normalized];
  const { ok, garments } = writeGlobalCatalog(next);
  if (!ok) throw new Error('Could not save garment — storage may be full.');
  return garments;
}

export function updateGlobalCatalogGarment(id, updates) {
  const catalog = readGlobalCatalog();
  const index = catalog.findIndex((item) => String(item.id) === String(id));
  if (index === -1) throw new Error('Garment not found');

  const updated = normalizeGarment({ ...catalog[index], ...updates, id: catalog[index].id });
  if (!updated) throw new Error('Invalid garment data');

  const next = [...catalog];
  next[index] = updated;

  const { ok, garments } = writeGlobalCatalog(next);
  if (!ok) throw new Error('Could not update garment — storage may be full.');
  return garments;
}

export function deleteGlobalCatalogGarment(id) {
  const next = readGlobalCatalog().filter((item) => String(item.id) !== String(id));
  const { ok, garments } = writeGlobalCatalog(next);
  if (!ok) throw new Error('Could not delete garment.');
  return garments;
}

export function garmentToCatalogProduct(garment) {
  const imageUrl = garment.imageUrl ?? garment.image_url ?? '';
  return {
    id: String(garment.id),
    sku: `SKU-VTON-${garment.id}`,
    brand: garment.brand || 'Wardrobe AI',
    name: garment.name,
    category: garment.category,
    price: Number(garment.price) || 0,
    image_url: imageUrl,
    ai_render_image: imageUrl,
    style_tags: [garment.category?.toLowerCase()].filter(Boolean),
  };
}

export function getEmptyGarmentForm() {
  return { ...EMPTY_FORM };
}

export function garmentToFormValues(garment) {
  return {
    name: garment?.name ?? '',
    price: garment?.price != null ? String(garment.price) : '',
    category: garment?.category ?? 'Tops',
    imageUrl: garment?.imageUrl ?? garment?.image_url ?? '',
  };
}
