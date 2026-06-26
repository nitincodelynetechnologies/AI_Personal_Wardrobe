-- Migration: 006_refresh_catalog_products (UP)
-- Replace catalog with 16 premium items and reliable Unsplash imagery

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('006_refresh_catalog_products')
ON CONFLICT (version) DO NOTHING;

INSERT INTO wardrobe.products (sku, brand, name, category, price, image_url, style_tags)
VALUES
  ('SKU-MEN-001', 'SSENSE', 'Tailored Charcoal Suit', 'Men', 12999.00,
   'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
   '["formal","tailored","suit"]'::jsonb),
  ('SKU-MEN-002', 'ZARA', 'Relaxed Linen Camp Shirt', 'Men', 3499.00,
   'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
   '["casual","linen","summer"]'::jsonb),
  ('SKU-MEN-003', 'SSENSE', 'Premium Fleece Hoodie', 'Men', 4299.00,
   'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
   '["streetwear","hoodie","comfort"]'::jsonb),
  ('SKU-MEN-004', 'ZARA', 'Structured Bomber Jacket', 'Men', 5999.00,
   'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
   '["outerwear","jacket","urban"]'::jsonb),
  ('SKU-WOMEN-001', 'SSENSE', 'Editorial Power Set', 'Women', 8499.00,
   'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
   '["editorial","statement","runway"]'::jsonb),
  ('SKU-WOMEN-002', 'ZARA', 'Silk Slip Midi Dress', 'Women', 4799.00,
   'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
   '["dress","elegant","evening"]'::jsonb),
  ('SKU-WOMEN-003', 'SSENSE', 'Elevated Casual Ensemble', 'Women', 3899.00,
   'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80',
   '["casual","minimal","everyday"]'::jsonb),
  ('SKU-WOMEN-004', 'ZARA', 'Urban Streetwear Capsule', 'Women', 3299.00,
   'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80',
   '["streetwear","urban","contemporary"]'::jsonb),
  ('SKU-ACC-001', 'SSENSE', 'Minimalist Chronograph', 'Accessories', 15999.00,
   'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
   '["watch","luxury","timepiece"]'::jsonb),
  ('SKU-ACC-002', 'ZARA', 'Structured Leather Tote', 'Accessories', 4999.00,
   'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
   '["handbag","leather","everyday"]'::jsonb),
  ('SKU-ACC-003', 'SSENSE', 'Aviator Sunglasses', 'Accessories', 6499.00,
   'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
   '["eyewear","summer","statement"]'::jsonb),
  ('SKU-ACC-004', 'ZARA', 'Gold Layered Necklace Set', 'Accessories', 2499.00,
   'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
   '["jewelry","gold","layered"]'::jsonb),
  ('SKU-FOOT-001', 'SSENSE', 'Carmine Runner Sneaker', 'Footwear', 7999.00,
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
   '["sneakers","sport","statement"]'::jsonb),
  ('SKU-FOOT-002', 'ZARA', 'Cloud White Court Sneaker', 'Footwear', 3999.00,
   'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
   '["sneakers","minimal","everyday"]'::jsonb),
  ('SKU-FOOT-003', 'SSENSE', 'Sculpted Stiletto Heel', 'Footwear', 9499.00,
   'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
   '["heels","evening","elegant"]'::jsonb),
  ('SKU-FOOT-004', 'ZARA', 'Chelsea Leather Boot', 'Footwear', 6299.00,
   'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
   '["boots","leather","autumn"]'::jsonb)
ON CONFLICT (sku) DO UPDATE SET
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  style_tags = EXCLUDED.style_tags,
  updated_at = NOW();

DELETE FROM wardrobe.products
WHERE sku NOT IN (
  'SKU-MEN-001', 'SKU-MEN-002', 'SKU-MEN-003', 'SKU-MEN-004',
  'SKU-WOMEN-001', 'SKU-WOMEN-002', 'SKU-WOMEN-003', 'SKU-WOMEN-004',
  'SKU-ACC-001', 'SKU-ACC-002', 'SKU-ACC-003', 'SKU-ACC-004',
  'SKU-FOOT-001', 'SKU-FOOT-002', 'SKU-FOOT-003', 'SKU-FOOT-004'
);

COMMIT;
