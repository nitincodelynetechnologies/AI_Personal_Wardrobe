-- Migration: 007_add_ai_render_image (UP)
-- Pre-mapped VTON render pairs for each catalog SKU

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('007_add_ai_render_image')
ON CONFLICT (version) DO NOTHING;

ALTER TABLE wardrobe.products
  ADD COLUMN IF NOT EXISTS ai_render_image TEXT;

UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1594938298598-708a05fce089?w=800&q=80' WHERE sku = 'SKU-MEN-001';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' WHERE sku = 'SKU-MEN-002';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1552374196-c536e16f65ca?w=800&q=80' WHERE sku = 'SKU-MEN-003';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1591047133409-47a58243f5b5?w=800&q=80' WHERE sku = 'SKU-MEN-004';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80' WHERE sku = 'SKU-WOMEN-001';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1595777453582-2d899e6d8b1e?w=800&q=80' WHERE sku = 'SKU-WOMEN-002';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80' WHERE sku = 'SKU-WOMEN-003';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1529139573956-d9ad40e4ffc4?w=800&q=80' WHERE sku = 'SKU-WOMEN-004';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1434056888555-438048964106?w=800&q=80' WHERE sku = 'SKU-ACC-001';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1548036328-c9a89d128774?w=800&q=80' WHERE sku = 'SKU-ACC-002';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80' WHERE sku = 'SKU-ACC-003';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80' WHERE sku = 'SKU-ACC-004';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1606107557195-0ccc9b751f4e?w=800&q=80' WHERE sku = 'SKU-FOOT-001';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80' WHERE sku = 'SKU-FOOT-002';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80' WHERE sku = 'SKU-FOOT-003';
UPDATE wardrobe.products SET ai_render_image = 'https://images.unsplash.com/photo-1617604612902-7fe693737274?w=800&q=80' WHERE sku = 'SKU-FOOT-004';

-- Backfill any rows missing a render with the catalog image as last resort
UPDATE wardrobe.products
SET ai_render_image = image_url
WHERE ai_render_image IS NULL OR trim(ai_render_image) = '';

ALTER TABLE wardrobe.products
  ALTER COLUMN ai_render_image SET NOT NULL;

COMMIT;
