-- Migration: 005_create_products_table (UP)
-- Phase 7: Product catalog

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('005_create_products_table')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku         VARCHAR(50) NOT NULL,
  brand       VARCHAR(100) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(50) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL,
  image_url   TEXT NOT NULL,
  style_tags  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT products_sku_uq UNIQUE (sku),
  CONSTRAINT products_category_chk
    CHECK (category IN ('Men', 'Women', 'Accessories', 'Footwear')),
  CONSTRAINT products_price_chk
    CHECK (price >= 0),
  CONSTRAINT products_image_url_chk
    CHECK (char_length(trim(image_url)) > 0)
);

CREATE INDEX IF NOT EXISTS products_category_idx ON wardrobe.products (category);
CREATE INDEX IF NOT EXISTS products_brand_idx ON wardrobe.products (brand);

DROP TRIGGER IF EXISTS products_set_updated_at ON wardrobe.products;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON wardrobe.products
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

INSERT INTO wardrobe.products (sku, brand, name, category, price, image_url, style_tags)
VALUES
  (
    'SKU-MEN-001',
    'COS',
    'Oversized Wool Coat',
    'Men',
    8999.00,
    'https://images.unsplash.com/photo-1594938291221-94f313b0e6ad?w=900&q=85&auto=format&fit=crop',
    '["minimalist","winter","outerwear"]'::jsonb
  ),
  (
    'SKU-MEN-002',
    'UNIQLO',
    'Minimal Denim Shirt',
    'Men',
    2499.00,
    'https://images.unsplash.com/photo-1602810318383-0e0111714b98?w=900&q=85&auto=format&fit=crop',
    '["casual","denim","essentials"]'::jsonb
  ),
  (
    'SKU-MEN-003',
    'MASSIMO DUTTI',
    'Cashmere Crew Sweater',
    'Men',
    4999.00,
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85&auto=format&fit=crop',
    '["luxury","knitwear","neutral"]'::jsonb
  ),
  (
    'SKU-WOMEN-001',
    'ARKET',
    'Silk Midi Dress',
    'Women',
    5499.00,
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=85&auto=format&fit=crop',
    '["elegant","evening","silk"]'::jsonb
  ),
  (
    'SKU-WOMEN-002',
    '& OTHER STORIES',
    'Structured Blazer',
    'Women',
    4299.00,
    'https://images.unsplash.com/photo-1591369822096-ffd037ecdf98?w=900&q=85&auto=format&fit=crop',
    '["tailored","office","modern"]'::jsonb
  ),
  (
    'SKU-WOMEN-003',
    'ZARA',
    'Linen Wide Trousers',
    'Women',
    2999.00,
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=85&auto=format&fit=crop',
    '["summer","linen","relaxed"]'::jsonb
  ),
  (
    'SKU-FOOT-001',
    'COMMON PROJECTS',
    'Leather Low Sneaker',
    'Footwear',
    6899.00,
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=85&auto=format&fit=crop',
    '["minimal","leather","everyday"]'::jsonb
  ),
  (
    'SKU-FOOT-002',
    'ACNE STUDIOS',
    'Chelsea Boot',
    'Footwear',
    7599.00,
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&q=85&auto=format&fit=crop',
    '["boots","classic","autumn"]'::jsonb
  ),
  (
    'SKU-ACC-001',
    'BOTTEGA VENETA',
    'Intrecciato Leather Tote',
    'Accessories',
    12999.00,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85&auto=format&fit=crop',
    '["luxury","leather","handbag"]'::jsonb
  ),
  (
    'SKU-ACC-002',
    'CELINE',
    'Rectangular Sunglasses',
    'Accessories',
    3299.00,
    'https://images.unsplash.com/photo-1572635196233-39f5af177123?w=900&q=85&auto=format&fit=crop',
    '["eyewear","summer","statement"]'::jsonb
  )
ON CONFLICT (sku) DO NOTHING;

COMMENT ON TABLE wardrobe.products IS 'Curated fashion catalog for browse and wardrobe inspiration';

COMMIT;
