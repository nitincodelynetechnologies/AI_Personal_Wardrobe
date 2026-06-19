-- Migration: 003_create_clothing_items_table (DOWN)
-- Phase 3 rollback

BEGIN;

DROP TRIGGER IF EXISTS clothing_items_set_updated_at ON wardrobe.clothing_items;
DROP TABLE IF EXISTS wardrobe.clothing_items;

DELETE FROM wardrobe.schema_migrations
WHERE version = '003_create_clothing_items_table';

COMMIT;
