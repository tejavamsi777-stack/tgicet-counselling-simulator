BEGIN;

-- This migration is additive. Every existing row is assigned to TG ICET before
-- exam-scoped constraints are enabled; no existing data is deleted or replaced.
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO exams (slug, short_name, name, description, is_active)
VALUES (
  'tg-icet',
  'TG ICET',
  'Telangana Integrated Common Entrance Test',
  'The migrated reference implementation for MBA and MCA admissions guidance.',
  true
)
ON CONFLICT (slug) DO UPDATE
SET short_name = EXCLUDED.short_name,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true,
    updated_at = NOW();

CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, code)
);

CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  program_id INT REFERENCES programs(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, code)
);

CREATE TABLE IF NOT EXISTS counselling_rounds (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  year_id INT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, year_id, code)
);

CREATE TABLE IF NOT EXISTS seat_inventory (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  college_id INT,
  course_id INT,
  branch_id INT REFERENCES branches(id) ON DELETE RESTRICT,
  category_id INT,
  gender VARCHAR(20),
  counselling_round_id INT REFERENCES counselling_rounds(id) ON DELETE RESTRICT,
  seats INT NOT NULL CHECK (seats >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allotment_rules (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  counselling_round_id INT REFERENCES counselling_rounds(id) ON DELETE RESTRICT,
  rule_key VARCHAR(100) NOT NULL,
  rule_value JSONB NOT NULL,
  source_url TEXT,
  source_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, counselling_round_id, rule_key)
);

-- Add nullable columns first, backfill them, then make them required.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE years ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE college_courses ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE cutoffs ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE mock_counselling_sessions ADD COLUMN IF NOT EXISTS exam_id INT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS exam_id INT;

UPDATE courses SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE categories SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE years SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE colleges SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE college_courses SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE cutoffs SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE predictions SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE mock_counselling_sessions SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;
UPDATE activity_logs SET exam_id = (SELECT id FROM exams WHERE slug = 'tg-icet') WHERE exam_id IS NULL;

ALTER TABLE courses ALTER COLUMN exam_id SET NOT NULL;
ALTER TABLE categories ALTER COLUMN exam_id SET NOT NULL;
ALTER TABLE years ALTER COLUMN exam_id SET NOT NULL;
ALTER TABLE colleges ALTER COLUMN exam_id SET NOT NULL;
ALTER TABLE college_courses ALTER COLUMN exam_id SET NOT NULL;
ALTER TABLE cutoffs ALTER COLUMN exam_id SET NOT NULL;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['courses', 'categories', 'years', 'colleges', 'college_courses', 'cutoffs', 'predictions', 'mock_counselling_sessions', 'activity_logs']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = table_name || '_exam_id_fkey' AND conrelid = ('public.' || table_name)::regclass
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE RESTRICT', table_name, table_name || '_exam_id_fkey');
    END IF;
  END LOOP;
END $$;

-- Existing identifiers are globally unique today. Scope them by exam only after
-- all production rows have been backfilled to preserve current values.
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_code_key;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_code_key;
ALTER TABLE years DROP CONSTRAINT IF EXISTS years_year_key;
ALTER TABLE colleges DROP CONSTRAINT IF EXISTS colleges_code_key;
ALTER TABLE college_courses DROP CONSTRAINT IF EXISTS college_courses_college_id_course_id_key;
ALTER TABLE cutoffs DROP CONSTRAINT IF EXISTS cutoffs_year_id_college_id_course_id_category_id_gender_key;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_exam_code_key') THEN ALTER TABLE courses ADD CONSTRAINT courses_exam_code_key UNIQUE (exam_id, code); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_exam_code_key') THEN ALTER TABLE categories ADD CONSTRAINT categories_exam_code_key UNIQUE (exam_id, code); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'years_exam_year_key') THEN ALTER TABLE years ADD CONSTRAINT years_exam_year_key UNIQUE (exam_id, year); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'colleges_exam_code_key') THEN ALTER TABLE colleges ADD CONSTRAINT colleges_exam_code_key UNIQUE (exam_id, code); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'college_courses_exam_college_course_key') THEN ALTER TABLE college_courses ADD CONSTRAINT college_courses_exam_college_course_key UNIQUE (exam_id, college_id, course_id); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cutoffs_exam_lookup_key') THEN ALTER TABLE cutoffs ADD CONSTRAINT cutoffs_exam_lookup_key UNIQUE (exam_id, year_id, college_id, course_id, category_id, gender); END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_courses_exam ON courses (exam_id, code);
CREATE INDEX IF NOT EXISTS idx_categories_exam ON categories (exam_id, code);
CREATE INDEX IF NOT EXISTS idx_years_exam ON years (exam_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_colleges_exam ON colleges (exam_id, code);
CREATE INDEX IF NOT EXISTS idx_college_courses_exam ON college_courses (exam_id, college_id, course_id);
CREATE INDEX IF NOT EXISTS idx_cutoffs_exam_lookup ON cutoffs (exam_id, year_id, course_id, category_id, gender);
CREATE INDEX IF NOT EXISTS idx_predictions_exam ON predictions (exam_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mock_counselling_sessions_exam ON mock_counselling_sessions (exam_id, created_at DESC);

COMMIT;
