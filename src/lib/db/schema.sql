-- ============================================================
-- MASA Coders — Omnichannel Inbox + CRM Schema
-- PostgreSQL — Run once via migrate.js or psql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Contacts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255),
  email       VARCHAR(255),
  phone       VARCHAR(50),
  avatar_url  TEXT,
  company     VARCHAR(255),
  tags        TEXT[]          DEFAULT '{}',
  metadata    JSONB           DEFAULT '{}',
  created_at  TIMESTAMPTZ     DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);

-- ── Platform Profiles (1 contact, N platforms) ──────────────
CREATE TABLE IF NOT EXISTS platform_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id          UUID REFERENCES contacts(id) ON DELETE CASCADE,
  platform            VARCHAR(50)  NOT NULL,  -- whatsapp|messenger|instagram|livechat|email
  platform_user_id    VARCHAR(255) NOT NULL,
  platform_username   VARCHAR(255),
  metadata            JSONB        DEFAULT '{}',
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(platform, platform_user_id)
);
CREATE INDEX IF NOT EXISTS idx_platform_profiles_contact ON platform_profiles(contact_id);
CREATE INDEX IF NOT EXISTS idx_platform_profiles_lookup  ON platform_profiles(platform, platform_user_id);

-- ── Conversations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id                UUID REFERENCES contacts(id),
  platform                  VARCHAR(50)  NOT NULL,
  platform_conversation_id  VARCHAR(255),
  status                    VARCHAR(30)  DEFAULT 'new',      -- new|active|waiting|resolved|closed
  assigned_to               VARCHAR(255),                    -- agent email / id
  ai_mode                   VARCHAR(20)  DEFAULT 'manual',   -- manual|semi_auto|full_auto
  intent                    VARCHAR(50),                     -- sales|support|inquiry|spam
  sentiment                 VARCHAR(20),                     -- positive|neutral|negative
  priority                  VARCHAR(20)  DEFAULT 'medium',   -- low|medium|high|urgent
  last_message_at           TIMESTAMPTZ,
  last_message_preview      TEXT,
  unread_count              INT          DEFAULT 0,
  is_archived               BOOLEAN      DEFAULT false,
  metadata                  JSONB        DEFAULT '{}',
  created_at                TIMESTAMPTZ  DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conv_status          ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conv_platform        ON conversations(platform);
CREATE INDEX IF NOT EXISTS idx_conv_contact         ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conv_last_msg        ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_platform_id     ON conversations(platform, platform_conversation_id);

-- ── Messages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  platform_message_id VARCHAR(255),
  direction           VARCHAR(10)  NOT NULL,   -- inbound|outbound
  sender_type         VARCHAR(20)  NOT NULL,   -- customer|agent|ai|system
  sender_id           VARCHAR(255),
  content             TEXT         NOT NULL,
  content_type        VARCHAR(50)  DEFAULT 'text', -- text|image|audio|video|file|template
  media_url           TEXT,
  ai_suggested        BOOLEAN      DEFAULT false,
  ai_confidence       FLOAT,
  status              VARCHAR(20)  DEFAULT 'sent', -- pending|sent|delivered|read|failed
  metadata            JSONB        DEFAULT '{}',
  created_at          TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_msg_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_platform_id  ON messages(platform_message_id);

-- ── AI Suggestions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  trigger_msg_id   UUID REFERENCES messages(id),
  suggested_reply  TEXT        NOT NULL,
  intent           VARCHAR(50),
  sentiment        VARCHAR(20),
  confidence       FLOAT,
  tokens_used      INT,
  status           VARCHAR(20) DEFAULT 'pending', -- pending|approved|edited|rejected|auto_sent
  approved_by      VARCHAR(255),
  edited_reply     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suggestions_conv ON ai_suggestions(conversation_id, created_at DESC);

-- ── CRM Leads ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID REFERENCES contacts(id),
  conversation_id UUID REFERENCES conversations(id),
  status          VARCHAR(20) DEFAULT 'new',  -- new|warm|hot|converted|lost
  intent          VARCHAR(50),
  estimated_value DECIMAL(12,2),
  notes           TEXT,
  follow_up_at    TIMESTAMPTZ,
  converted_at    TIMESTAMPTZ,
  assigned_to     VARCHAR(255),
  source_platform VARCHAR(50),
  pipeline_stage  INT         DEFAULT 0,      -- 0=New 1=Contacted 2=Qualified 3=Proposal 4=Won 5=Lost
  tags            TEXT[]      DEFAULT '{}',
  metadata        JSONB       DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_contact ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_follow  ON leads(follow_up_at) WHERE follow_up_at IS NOT NULL;

-- ── Analytics Events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type       VARCHAR(100) NOT NULL,  -- msg_received|msg_sent|ai_suggested|ai_approved|lead_created|conv_resolved
  conversation_id  UUID,
  message_id       UUID,
  lead_id          UUID,
  platform         VARCHAR(50),
  agent_id         VARCHAR(255),
  metadata         JSONB        DEFAULT '{}',
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_type     ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics_events(platform, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conv     ON analytics_events(conversation_id);

-- ── Updated-at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_contacts_updated_at     BEFORE UPDATE ON contacts      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER trg_leads_updated_at        BEFORE UPDATE ON leads         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
