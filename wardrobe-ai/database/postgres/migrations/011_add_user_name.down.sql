-- Migration: 011_add_user_name (DOWN)

BEGIN;

ALTER TABLE wardrobe.users
  DROP COLUMN IF EXISTS name;

DELETE FROM wardrobe.schema_migrations
WHERE version = '011_add_user_name';

COMMIT;
