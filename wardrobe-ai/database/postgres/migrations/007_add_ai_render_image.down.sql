-- Migration: 007_add_ai_render_image (DOWN)

BEGIN;

ALTER TABLE wardrobe.products DROP COLUMN IF EXISTS ai_render_image;

DELETE FROM wardrobe.schema_migrations WHERE version = '007_add_ai_render_image';

COMMIT;
