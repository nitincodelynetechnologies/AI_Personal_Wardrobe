-- Migration: 008_create_orders_table (DOWN)

BEGIN;

DROP TRIGGER IF EXISTS orders_set_updated_at ON wardrobe.orders;
DROP TABLE IF EXISTS wardrobe.orders;

DELETE FROM wardrobe.schema_migrations WHERE version = '008_create_orders_table';

COMMIT;
