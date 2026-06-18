-- Migration: 001_create_users_table (UP)
-- Phase 1: User Management schema for AI Personal Wardrobe Platform

BEGIN;

CREATE TABLE IF NOT EXISTS wardrobe.schema_migrations (
  id          SERIAL PRIMARY KEY,
  version     VARCHAR(255) NOT NULL UNIQUE,
  applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('001_create_users_table')
ON CONFLICT (version) DO NOTHING;

CREATE TYPE wardrobe.user_status AS ENUM (
  'pending',
  'active',
  'inactive',
  'suspended',
  'deleted'
);

CREATE TABLE IF NOT EXISTS wardrobe.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255),
  mobile        VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  status        wardrobe.user_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_format_chk
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

  CONSTRAINT users_contact_required_chk
    CHECK (email IS NOT NULL OR mobile IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON wardrobe.users (LOWER(email))
  WHERE email IS NOT NULL AND status <> 'deleted';

CREATE UNIQUE INDEX IF NOT EXISTS users_mobile_unique_idx
  ON wardrobe.users (mobile)
  WHERE mobile IS NOT NULL AND status <> 'deleted';

CREATE INDEX IF NOT EXISTS users_status_idx
  ON wardrobe.users (status);

CREATE INDEX IF NOT EXISTS users_created_at_idx
  ON wardrobe.users (created_at DESC);

CREATE OR REPLACE FUNCTION wardrobe.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON wardrobe.users;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON wardrobe.users
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

COMMENT ON TABLE wardrobe.users IS 'Platform users for authentication and profile management';
COMMENT ON COLUMN wardrobe.users.password_hash IS 'Bcrypt or Argon2 hash — never store plaintext passwords';
COMMENT ON COLUMN wardrobe.users.status IS 'Account lifecycle state';

COMMIT;
