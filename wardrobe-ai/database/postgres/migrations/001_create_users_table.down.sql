-- Migration: 001_create_users_table (DOWN)
-- Rolls back the users table and related objects

BEGIN;

DROP TRIGGER IF EXISTS users_set_updated_at ON wardrobe.users;
DROP FUNCTION IF EXISTS wardrobe.set_updated_at();
DROP TABLE IF EXISTS wardrobe.users;
DROP TYPE IF EXISTS wardrobe.user_status;

DELETE FROM wardrobe.schema_migrations
WHERE version = '001_create_users_table';

COMMIT;
