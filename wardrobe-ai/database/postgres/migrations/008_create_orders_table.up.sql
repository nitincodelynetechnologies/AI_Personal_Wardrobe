-- Migration: 008_create_orders_table (UP)
-- E-commerce orders for checkout + admin dashboard

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('008_create_orders_table')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.orders (
  id              VARCHAR(32) PRIMARY KEY,
  user_id         UUID REFERENCES wardrobe.users(id) ON DELETE SET NULL,
  customer_name   VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'Pending',
  amount          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  item_count      INTEGER NOT NULL DEFAULT 0,
  payment_method  VARCHAR(50),
  shipping        JSONB NOT NULL DEFAULT '{}'::jsonb,
  line_items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  products        JSONB NOT NULL DEFAULT '[]'::jsonb,
  source          VARCHAR(50) NOT NULL DEFAULT 'checkout',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT orders_amount_chk CHECK (amount >= 0),
  CONSTRAINT orders_item_count_chk CHECK (item_count >= 0)
);

CREATE INDEX IF NOT EXISTS orders_email_idx ON wardrobe.orders (LOWER(email));
CREATE INDEX IF NOT EXISTS orders_status_idx ON wardrobe.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON wardrobe.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON wardrobe.orders (user_id);

DROP TRIGGER IF EXISTS orders_set_updated_at ON wardrobe.orders;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON wardrobe.orders
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

COMMIT;
