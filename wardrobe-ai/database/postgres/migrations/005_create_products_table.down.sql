-- Migration: 005_create_products_table (DOWN)

BEGIN;

DROP TRIGGER IF EXISTS products_set_updated_at ON wardrobe.products;
DROP TABLE IF EXISTS wardrobe.products;

DELETE FROM wardrobe.schema_migrations WHERE version = '005_create_products_table';

COMMIT;
