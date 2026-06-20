-- Migration: 004_create_outfits_table (UP)
-- Phase 4: AI-generated outfit recommendations

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('004_create_outfits_table')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.outfits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES wardrobe.users (id) ON DELETE CASCADE,
  name          VARCHAR(100),
  top_id        UUID REFERENCES wardrobe.clothing_items (id) ON DELETE SET NULL,
  bottom_id     UUID REFERENCES wardrobe.clothing_items (id) ON DELETE SET NULL,
  footwear_id   UUID REFERENCES wardrobe.clothing_items (id) ON DELETE SET NULL,
  accessory_id  UUID REFERENCES wardrobe.clothing_items (id) ON DELETE SET NULL,
  style_score   INTEGER NOT NULL DEFAULT 0,
  season_tag    VARCHAR(20) NOT NULL DEFAULT 'All',
  is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT outfits_name_chk
    CHECK (name IS NULL OR char_length(trim(name)) > 0),

  CONSTRAINT outfits_style_score_chk
    CHECK (style_score >= 0 AND style_score <= 100),

  CONSTRAINT outfits_season_tag_chk
    CHECK (season_tag IN ('Summer', 'Winter', 'Spring', 'Fall', 'All')),

  CONSTRAINT outfits_has_item_chk
    CHECK (
      top_id IS NOT NULL
      OR bottom_id IS NOT NULL
      OR footwear_id IS NOT NULL
      OR accessory_id IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS outfits_user_id_idx
  ON wardrobe.outfits (user_id);

CREATE INDEX IF NOT EXISTS outfits_user_season_idx
  ON wardrobe.outfits (user_id, season_tag);

CREATE INDEX IF NOT EXISTS outfits_user_favorite_idx
  ON wardrobe.outfits (user_id, is_favorite)
  WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS outfits_style_score_idx
  ON wardrobe.outfits (user_id, style_score DESC);

CREATE INDEX IF NOT EXISTS outfits_created_at_idx
  ON wardrobe.outfits (created_at DESC);

DROP TRIGGER IF EXISTS outfits_set_updated_at ON wardrobe.outfits;

CREATE TRIGGER outfits_set_updated_at
  BEFORE UPDATE ON wardrobe.outfits
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

COMMENT ON TABLE wardrobe.outfits IS 'AI-generated outfits linking clothing items into cohesive looks';
COMMENT ON COLUMN wardrobe.outfits.style_score IS 'AI confidence score for the outfit (0-100)';
COMMENT ON COLUMN wardrobe.outfits.season_tag IS 'Season suitability tag for the outfit';

COMMIT;
