import { Injectable, Logger } from '@nestjs/common';
import { POSTGRES_TABLES } from '../database/schema.registry';
import { PostgresService } from '../database/postgres.service';
import {
  CATALOG_SEED_PRODUCTS,
  GLB_CATALOG_PRODUCTS,
  NON_3D_PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES,
  PRODUCT_COLUMNS,
  PRODUCT_GLB_BY_SKU,
  PRODUCT_HAS_SLEEVES_BY_SKU,
  ProductCategory,
} from './constants/products.constants';
import { ProductRecord } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly postgresService: PostgresService) {}

  async findAll(category?: string): Promise<ProductRecord[]> {
    const normalizedCategory = this.normalizeCategory(category);

    if (!this.postgresService.isReady()) {
      this.logger.warn('PostgreSQL unavailable — serving catalog seed data');
      return this.filterSeedProducts(normalizedCategory);
    }

    try {
      const products = await this.queryProducts(normalizedCategory);
      if (products.length > 0) {
        return this.mergeGlbCatalogProducts(products, normalizedCategory);
      }

      this.logger.warn('Products table empty — serving catalog seed data');
      return this.filterSeedProducts(normalizedCategory);
    } catch (error) {
      this.logger.warn('Products query failed — serving catalog seed data', error);
      return this.filterSeedProducts(normalizedCategory);
    }
  }

  private async queryProducts(category?: ProductCategory): Promise<ProductRecord[]> {
    try {
      return await this.queryProductsWithColumns(PRODUCT_COLUMNS, category);
    } catch (error) {
      if (!this.isMissingColumnError(error, 'ai_render_image')) {
        throw error;
      }

      this.logger.warn(
        'products.ai_render_image column missing — querying catalog without render image column',
      );

      const legacyColumns =
        'id, sku, brand, name, category, price, image_url, style_tags, created_at, updated_at';

      return await this.queryProductsWithColumns(legacyColumns, category, true);
    }
  }

  private async queryProductsWithColumns(
    columns: string,
    category?: ProductCategory,
    legacy = false,
  ): Promise<ProductRecord[]> {
    const params: string[] = [];
    let whereClause = '';

    if (category) {
      params.push(category);
      whereClause = `WHERE category = $1`;
    }

    const result = await this.postgresService.query<ProductRecord>(
      `SELECT ${columns}
       FROM ${POSTGRES_TABLES.PRODUCTS}
       ${whereClause}
       ORDER BY created_at DESC`,
      params,
    );

    return result.rows.map((row) => ({
      ...row,
      price: Number(row.price),
      style_tags: this.normalizeTags(row.style_tags),
      ai_render_image: legacy
        ? row.image_url
        : row.ai_render_image ?? row.image_url,
    }));
  }

  private isMissingColumnError(error: unknown, column: string): boolean {
    if (!error || typeof error !== 'object') return false;
    const pgError = error as { code?: string; message?: string };
    return (
      pgError.code === '42703' &&
      typeof pgError.message === 'string' &&
      pgError.message.includes(column)
    );
  }

  private filterSeedProducts(category?: ProductCategory): ProductRecord[] {
    const now = new Date().toISOString();
    const seed = CATALOG_SEED_PRODUCTS.filter(
      (product) => !category || product.category === category,
    );

    return seed.map((product) => ({
      id: `seed-${product.sku.toLowerCase()}`,
      sku: product.sku,
      brand: product.brand,
      name: product.name,
      category: product.category as ProductCategory,
      price: product.price,
      image_url: product.image_url,
      ai_render_image: product.ai_render_image,
      glb_url: this.resolveSeedGlbUrl(product),
      has_sleeves: this.resolveSeedHasSleeves(product),
      style_tags: [...product.style_tags],
      created_at: now,
      updated_at: now,
    }));
  }

  private resolveSeedGlbUrl(product: (typeof CATALOG_SEED_PRODUCTS)[number]): string | undefined {
    if (NON_3D_PRODUCT_CATEGORIES.has(product.category)) {
      return undefined;
    }

    if ('glb_url' in product && product.glb_url) {
      return product.glb_url;
    }

    return undefined;
  }

  private resolveSeedHasSleeves(
    product: (typeof CATALOG_SEED_PRODUCTS)[number],
  ): boolean | undefined {
    if (NON_3D_PRODUCT_CATEGORIES.has(product.category)) {
      return undefined;
    }

    if ('has_sleeves' in product && product.has_sleeves != null) {
      return Boolean(product.has_sleeves);
    }

    return PRODUCT_HAS_SLEEVES_BY_SKU[product.sku];
  }

  private mergeGlbCatalogProducts(
    products: ProductRecord[],
    category?: ProductCategory,
  ): ProductRecord[] {
    const now = new Date().toISOString();
    const existingSkus = new Set(products.map((product) => product.sku));

    const glbExtras = GLB_CATALOG_PRODUCTS.filter((product) => {
      if (existingSkus.has(product.sku)) return false;
      if (category && product.category !== category) return false;
      return true;
    }).map((product) => ({
      id: `seed-${product.sku.toLowerCase()}`,
      sku: product.sku,
      brand: product.brand,
      name: product.name,
      category: product.category as ProductCategory,
      price: product.price,
      image_url: product.image_url,
      ai_render_image: product.ai_render_image,
      glb_url: product.glb_url,
      has_sleeves: product.has_sleeves ?? PRODUCT_HAS_SLEEVES_BY_SKU[product.sku],
      style_tags: [...product.style_tags],
      created_at: now,
      updated_at: now,
    }));

    const enriched = products.map((product) => {
      const glbSeed = GLB_CATALOG_PRODUCTS.find((entry) => entry.sku === product.sku);

      return {
        ...product,
        image_url: product.image_url?.trim() || glbSeed?.image_url || product.image_url,
        ai_render_image: product.ai_render_image || glbSeed?.ai_render_image || product.image_url,
        glb_url: this.resolveProductGlbUrl(product, glbSeed),
        has_sleeves: this.resolveProductHasSleeves(product, glbSeed),
      };
    });

    return [...glbExtras, ...enriched];
  }

  private resolveProductHasSleeves(
    product: ProductRecord,
    glbSeed?: (typeof GLB_CATALOG_PRODUCTS)[number],
  ): boolean | undefined {
    if (NON_3D_PRODUCT_CATEGORIES.has(product.category)) {
      return undefined;
    }

    if (product.has_sleeves != null) {
      return product.has_sleeves;
    }

    const seedEntry = CATALOG_SEED_PRODUCTS.find((entry) => entry.sku === product.sku);
    const seedHasSleeves =
      seedEntry && 'has_sleeves' in seedEntry ? seedEntry.has_sleeves : undefined;

    return (
      seedHasSleeves ??
      glbSeed?.has_sleeves ??
      PRODUCT_HAS_SLEEVES_BY_SKU[product.sku]
    );
  }

  private resolveProductGlbUrl(
    product: ProductRecord,
    glbSeed?: (typeof GLB_CATALOG_PRODUCTS)[number],
  ): string | undefined {
    if (NON_3D_PRODUCT_CATEGORIES.has(product.category)) {
      return undefined;
    }

    const explicit = product.glb_url?.trim();
    if (explicit) {
      if (product.sku && !PRODUCT_GLB_BY_SKU[product.sku]) {
        return undefined;
      }
      return explicit;
    }

    const seedEntry = CATALOG_SEED_PRODUCTS.find((entry) => entry.sku === product.sku);
    const seedGlb =
      seedEntry && 'glb_url' in seedEntry ? seedEntry.glb_url?.trim() : undefined;
    if (seedGlb) return seedGlb;

    return glbSeed?.glb_url?.trim() || undefined;
  }

  private normalizeCategory(category?: string): ProductCategory | undefined {
    if (!category || category === 'All') return undefined;
    return PRODUCT_CATEGORIES.includes(category as ProductCategory)
      ? (category as ProductCategory)
      : undefined;
  }

  private normalizeTags(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((tag): tag is string => typeof tag === 'string');
    }
    return [];
  }
}
