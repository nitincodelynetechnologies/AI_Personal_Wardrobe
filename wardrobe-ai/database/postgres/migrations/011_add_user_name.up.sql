-- Migration: 011_add_user_name (UP)
-- Add optional display name to platform users

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('011_add_user_name')
ON CONFLICT (version) DO NOTHING;

ALTER TABLE wardrobe.users
  ADD COLUMN IF NOT EXISTS name VARCHAR(255);

COMMENT ON COLUMN wardrobe.users.name IS 'User display name for greetings and admin listings';

COMMIT;
