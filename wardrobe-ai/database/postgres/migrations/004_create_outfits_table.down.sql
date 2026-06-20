-- Migration: 004_create_outfits_table (DOWN)
-- Phase 4 rollback

BEGIN;

DROP TRIGGER IF EXISTS outfits_set_updated_at ON wardrobe.outfits;
DROP TABLE IF EXISTS wardrobe.outfits;

DELETE FROM wardrobe.schema_migrations
WHERE version = '004_create_outfits_table';

COMMIT;
