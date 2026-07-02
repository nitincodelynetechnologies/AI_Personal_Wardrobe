-- Migration: 009_create_coupons_table (DOWN)

BEGIN;

DROP TRIGGER IF EXISTS coupons_set_updated_at ON wardrobe.coupons;
DROP TABLE IF EXISTS wardrobe.coupons;

DELETE FROM wardrobe.schema_migrations WHERE version = '009_create_coupons_table';

COMMIT;
