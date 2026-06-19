-- Migration: 003_create_clothing_items_table (UP)
-- Phase 3: Digital wardrobe clothing items

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('003_create_clothing_items_table')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.clothing_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES wardrobe.users (id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  category      VARCHAR(50) NOT NULL,
  sub_category  VARCHAR(100),
  color_hex     VARCHAR(7),
  season        VARCHAR(20) NOT NULL DEFAULT 'All',
  is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT clothing_items_image_url_chk
    CHECK (char_length(trim(image_url)) > 0),

  CONSTRAINT clothing_items_category_chk
    CHECK (char_length(trim(category)) > 0),

  CONSTRAINT clothing_items_color_hex_chk
    CHECK (color_hex IS NULL OR color_hex ~* '^#[0-9A-F]{6}$'),

  CONSTRAINT clothing_items_season_chk
    CHECK (season IN ('Summer', 'Winter', 'Spring', 'Fall', 'All'))
);

CREATE INDEX IF NOT EXISTS clothing_items_user_id_idx
  ON wardrobe.clothing_items (user_id);

CREATE INDEX IF NOT EXISTS clothing_items_user_category_idx
  ON wardrobe.clothing_items (user_id, category);

CREATE INDEX IF NOT EXISTS clothing_items_user_favorite_idx
  ON wardrobe.clothing_items (user_id, is_favorite)
  WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS clothing_items_created_at_idx
  ON wardrobe.clothing_items (created_at DESC);

DROP TRIGGER IF EXISTS clothing_items_set_updated_at ON wardrobe.clothing_items;

CREATE TRIGGER clothing_items_set_updated_at
  BEFORE UPDATE ON wardrobe.clothing_items
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

COMMENT ON TABLE wardrobe.clothing_items IS 'User-owned clothing items for digital wardrobe and outfit matching';
COMMENT ON COLUMN wardrobe.clothing_items.image_url IS 'MinIO/S3 object URL for the clothing image';
COMMENT ON COLUMN wardrobe.clothing_items.color_hex IS 'Dominant color as #RRGGBB hex code';

COMMIT;
