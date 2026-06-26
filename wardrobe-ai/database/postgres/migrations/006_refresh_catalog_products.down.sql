-- Migration: 006_refresh_catalog_products (DOWN)

BEGIN;

DELETE FROM wardrobe.schema_migrations WHERE version = '006_refresh_catalog_products';

COMMIT;
