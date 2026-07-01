import { DEFAULT_GARMENTS } from '@/features/catalog/constants/catalogProducts';
import { enrichProductWithGlb } from '@/features/catalog/constants/garmentModels';
import {
  garmentToCatalogProduct,
  readGlobalCatalog,
} from '@/features/catalog/utils/globalCatalogStorage';

export function filterCatalogByCategory(products, category = 'All') {
  if (!category || category === 'All') return products;
  return products.filter((product) => product.category === category);
}

function getProductSearchHaystack(product) {
  const tags = product.style_tags ?? product.tags ?? [];
  const tagText = Array.isArray(tags) ? tags.join(' ') : String(tags ?? '');

  return [
    product.name,
    product.title,
    product.category,
    product.brand,
    product.description,
    product.sub_category,
    tagText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Case-insensitive search across name/title, category, brand, description, and tags. */
export function filterCatalogBySearch(products, searchTerm) {
  const query = searchTerm?.trim().toLowerCase();
  if (!query) return products;

  return products.filter((product) => getProductSearchHaystack(product).includes(query));
}

export function buildCatalogSearchPath(searchTerm) {
  const query = searchTerm?.trim();
  if (!query) return '/catalog';
  return `/catalog?search=${encodeURIComponent(query)}`;
}

/** DEFAULT_GARMENTS (3D + 2D system catalog) + admin localStorage items. */
export function buildMergedCatalog() {
  const adminAddedGarments = readGlobalCatalog();
  const adminProducts = adminAddedGarments.map(garmentToCatalogProduct);
  const combinedCatalog = [...DEFAULT_GARMENTS, ...adminProducts];
  return combinedCatalog.map(enrichProductWithGlb);
}

export async function fetchProducts(_token, { category } = {}) {
  const combinedCatalog = buildMergedCatalog();
  return filterCatalogByCategory(combinedCatalog, category);
}
