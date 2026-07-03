-- Migration: 010_create_support_chat_tables (DOWN)

BEGIN;

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON wardrobe.support_tickets;
DROP TABLE IF EXISTS wardrobe.support_messages;
DROP TABLE IF EXISTS wardrobe.support_tickets;

DELETE FROM wardrobe.schema_migrations
WHERE version = '010_create_support_chat_tables';

COMMIT;
