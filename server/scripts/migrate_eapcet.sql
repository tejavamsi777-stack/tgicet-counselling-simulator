-- TG EAPCET scrape cache table
-- Stores scraped JSON payloads keyed by name (e.g. "notifications", "schedule_raw")
CREATE TABLE IF NOT EXISTS eapcet_scrape_cache (
  cache_key   TEXT PRIMARY KEY,
  payload     JSONB        NOT NULL DEFAULT '[]',
  scraped_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- User document checklist persistence
-- Stores which document IDs a user has ticked for each exam
CREATE TABLE IF NOT EXISTS user_document_checklist (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_slug   TEXT         NOT NULL DEFAULT 'tg-eapcet',
  doc_id      TEXT         NOT NULL,
  ticked      BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, exam_slug, doc_id)
);

CREATE INDEX IF NOT EXISTS idx_user_checklist_user ON user_document_checklist(user_id, exam_slug);
