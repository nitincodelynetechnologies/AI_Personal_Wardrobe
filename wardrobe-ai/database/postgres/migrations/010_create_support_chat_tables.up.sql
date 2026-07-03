-- Migration: 010_create_support_chat_tables (UP)
-- Customer support tickets + messages for live admin handoff

BEGIN;

INSERT INTO wardrobe.schema_migrations (version)
VALUES ('010_create_support_chat_tables')
ON CONFLICT (version) DO NOTHING;

CREATE TABLE IF NOT EXISTS wardrobe.support_tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id       VARCHAR(64) NOT NULL UNIQUE,
  user_id         UUID REFERENCES wardrobe.users(id) ON DELETE SET NULL,
  user_name       VARCHAR(255),
  email           VARCHAR(255) NOT NULL,
  subject         VARCHAR(500),
  status          VARCHAR(50) NOT NULL DEFAULT 'open',
  session_state   VARCHAR(50) NOT NULL DEFAULT 'ai',
  admin_unread    BOOLEAN NOT NULL DEFAULT TRUE,
  user_unread     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_email_idx
  ON wardrobe.support_tickets (LOWER(email));

CREATE INDEX IF NOT EXISTS support_tickets_status_idx
  ON wardrobe.support_tickets (status);

CREATE INDEX IF NOT EXISTS support_tickets_admin_unread_idx
  ON wardrobe.support_tickets (admin_unread)
  WHERE admin_unread = TRUE;

CREATE TABLE IF NOT EXISTS wardrobe.support_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES wardrobe.support_tickets(id) ON DELETE CASCADE,
  sender      VARCHAR(20) NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT support_messages_sender_chk
    CHECK (sender IN ('user', 'admin', 'system', 'bot'))
);

CREATE INDEX IF NOT EXISTS support_messages_ticket_id_idx
  ON wardrobe.support_messages (ticket_id, created_at ASC);

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON wardrobe.support_tickets;
CREATE TRIGGER support_tickets_set_updated_at
  BEFORE UPDATE ON wardrobe.support_tickets
  FOR EACH ROW EXECUTE FUNCTION wardrobe.set_updated_at();

COMMENT ON TABLE wardrobe.support_tickets IS 'Customer support chat sessions';
COMMENT ON COLUMN wardrobe.support_tickets.session_state IS 'ai | waiting_for_admin | human_active';
COMMENT ON TABLE wardrobe.support_messages IS 'Messages within a support ticket thread';

COMMIT;
