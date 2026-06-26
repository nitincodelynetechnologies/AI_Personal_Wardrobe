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
