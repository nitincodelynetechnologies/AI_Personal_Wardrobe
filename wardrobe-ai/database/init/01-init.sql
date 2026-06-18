-- AI Personal Wardrobe Platform — PostgreSQL bootstrap
-- Runs automatically on first container start via docker-entrypoint-initdb.d

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema namespace for application tables (migrations will expand this)
CREATE SCHEMA IF NOT EXISTS wardrobe;

COMMENT ON SCHEMA wardrobe IS 'Core application schema for AI Personal Wardrobe Platform';
