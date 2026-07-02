-- Migration: 009_create_coupons_table (UP)

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('009_create_coupons_table')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.coupons (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) NOT NULL UNIQUE,
  discount    NUMERIC(10, 2) NOT NULL,
  type        VARCHAR(20) NOT NULL DEFAULT 'percent',
  status      VARCHAR(20) NOT NULL DEFAULT 'inactive',
  description TEXT,
  uses        INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT coupons_type_chk CHECK (type IN ('percent', 'flat')),
  CONSTRAINT coupons_status_chk CHECK (status IN ('active', 'inactive')),
  CONSTRAINT coupons_discount_chk CHECK (discount > 0)
);

CREATE INDEX IF NOT EXISTS coupons_status_idx ON wardrobe.coupons (status);

DROP TRIGGER IF EXISTS coupons_set_updated_at ON wardrobe.coupons;

CREATE TRIGGER coupons_set_updated_at
  BEFORE UPDATE ON wardrobe.coupons
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

INSERT INTO wardrobe.coupons (code, discount, type, status, description, uses)
VALUES
  ('AI30OFF', 30, 'percent', 'active', 'Limited-time AI styling discount', 0),
  ('WELCOME10', 10, 'percent', 'inactive', 'Welcome offer for new members', 0),
  ('VTON500', 500, 'flat', 'inactive', 'Virtual try-on bundle savings', 0)
ON CONFLICT (code) DO NOTHING;

COMMIT;
