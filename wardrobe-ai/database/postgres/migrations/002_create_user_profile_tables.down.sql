-- Migration: 002_create_user_profile_tables (DOWN)

BEGIN;

DROP TRIGGER IF EXISTS fashion_dna_set_updated_at ON wardrobe.fashion_dna;
DROP TRIGGER IF EXISTS user_preferences_set_updated_at ON wardrobe.user_preferences;
DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON wardrobe.user_profiles;

DROP TABLE IF EXISTS wardrobe.fashion_dna;
DROP TABLE IF EXISTS wardrobe.user_preferences;
DROP TABLE IF EXISTS wardrobe.user_profiles;

DELETE FROM wardrobe.schema_migrations
WHERE version = '002_create_user_profile_tables';

COMMIT;
