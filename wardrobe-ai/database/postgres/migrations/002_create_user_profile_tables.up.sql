-- Migration: 002_create_user_profile_tables (UP)
-- Phase 2: User profiles, preferences, and Fashion DNA

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('002_create_user_profile_tables')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.user_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES wardrobe.users (id) ON DELETE CASCADE,
  gender      VARCHAR(50),
  age         SMALLINT,
  height      NUMERIC(5, 2),
  weight      NUMERIC(5, 2),
  body_type   VARCHAR(50),
  skin_tone   VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_profiles_age_chk
    CHECK (age IS NULL OR (age >= 0 AND age <= 150)),

  CONSTRAINT user_profiles_height_chk
    CHECK (height IS NULL OR height > 0),

  CONSTRAINT user_profiles_weight_chk
    CHECK (weight IS NULL OR weight > 0)
);

CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx
  ON wardrobe.user_profiles (user_id);

CREATE TABLE IF NOT EXISTS wardrobe.user_preferences (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES wardrobe.users (id) ON DELETE CASCADE,
  favorite_colors  JSONB NOT NULL DEFAULT '[]'::jsonb,
  favorite_brands  JSONB NOT NULL DEFAULT '[]'::jsonb,
  budget_range     VARCHAR(50),
  fashion_style    VARCHAR(100),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_preferences_favorite_colors_chk
    CHECK (jsonb_typeof(favorite_colors) = 'array'),

  CONSTRAINT user_preferences_favorite_brands_chk
    CHECK (jsonb_typeof(favorite_brands) = 'array')
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx
  ON wardrobe.user_preferences (user_id);

CREATE INDEX IF NOT EXISTS user_preferences_fashion_style_idx
  ON wardrobe.user_preferences (fashion_style);

CREATE TABLE IF NOT EXISTS wardrobe.fashion_dna (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES wardrobe.users (id) ON DELETE CASCADE,
  style_score      NUMERIC(5, 2),
  color_affinity   JSONB NOT NULL DEFAULT '{}'::jsonb,
  brand_affinity   JSONB NOT NULL DEFAULT '{}'::jsonb,
  lifestyle_score  NUMERIC(5, 2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fashion_dna_style_score_chk
    CHECK (style_score IS NULL OR (style_score >= 0 AND style_score <= 100)),

  CONSTRAINT fashion_dna_lifestyle_score_chk
    CHECK (lifestyle_score IS NULL OR (lifestyle_score >= 0 AND lifestyle_score <= 100)),

  CONSTRAINT fashion_dna_color_affinity_chk
    CHECK (jsonb_typeof(color_affinity) = 'object'),

  CONSTRAINT fashion_dna_brand_affinity_chk
    CHECK (jsonb_typeof(brand_affinity) = 'object')
);

CREATE INDEX IF NOT EXISTS fashion_dna_user_id_idx
  ON wardrobe.fashion_dna (user_id);

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON wardrobe.user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
  BEFORE UPDATE ON wardrobe.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

DROP TRIGGER IF EXISTS user_preferences_set_updated_at ON wardrobe.user_preferences;
CREATE TRIGGER user_preferences_set_updated_at
  BEFORE UPDATE ON wardrobe.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

DROP TRIGGER IF EXISTS fashion_dna_set_updated_at ON wardrobe.fashion_dna;
CREATE TRIGGER fashion_dna_set_updated_at
  BEFORE UPDATE ON wardrobe.fashion_dna
  FOR EACH ROW
  EXECUTE FUNCTION wardrobe.set_updated_at();

COMMENT ON TABLE wardrobe.user_profiles IS 'Physical profile attributes for fit and styling';
COMMENT ON TABLE wardrobe.user_preferences IS 'Explicit fashion preferences captured during onboarding';
COMMENT ON TABLE wardrobe.fashion_dna IS 'AI-derived Fashion DNA scores and affinity maps';

COMMIT;
