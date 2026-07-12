-- ========== CORE REFERENCE TABLES ==========

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,     -- MBA, MCA, MBT, MTM
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,     -- OC, BC-A, SC, ST, EWS, etc.
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE years (
  id SERIAL PRIMARY KEY,
  year INT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== COLLEGES ==========

CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  district_id INT REFERENCES districts(id),
  place VARCHAR(150),
  university VARCHAR(100),
  ownership_type VARCHAR(20),           -- Private, Government, UNIV, SF etc.
  is_minority BOOLEAN DEFAULT false,
  is_girls BOOLEAN DEFAULT false,
  is_self_finance BOOLEAN DEFAULT false,
  website VARCHAR(255),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE college_courses (
  id SERIAL PRIMARY KEY,
  college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id),
  seats INT,
  fee INT,
  UNIQUE (college_id, course_id)
);

-- ========== CUTOFFS ==========

CREATE TABLE cutoffs (
  id SERIAL PRIMARY KEY,
  year_id INT REFERENCES years(id),
  college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id),
  category_id INT REFERENCES categories(id),
  gender VARCHAR(10) NOT NULL,          -- Male, Female
  cutoff_rank INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year_id, college_id, course_id, category_id, gender)
);

CREATE INDEX idx_cutoffs_lookup ON cutoffs (year_id, course_id, category_id, gender);

-- ========== USERS & AUTH ==========

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL      -- super_admin, admin, editor, viewer
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),           -- null if Google-only login
  google_id VARCHAR(255) UNIQUE,
  name VARCHAR(150),
  role_id INT REFERENCES roles(id),     -- null for regular visitors
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== SAVED USER DATA ==========

CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  rank INT,
  category_id INT REFERENCES categories(id),
  gender VARCHAR(10),
  course_id INT REFERENCES courses(id),
  year_id INT REFERENCES years(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mock_counselling_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150),                    -- lets a user label multiple saved sessions
  course_id INT REFERENCES courses(id),
  selected_districts TEXT[],
  preferences JSONB,                    -- { collegeCode: preferenceNumber }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== CONTENT / ADMIN TOOLS (phase 6) ==========

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(30),                     -- news, deadline, popup, banner
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  type VARCHAR(30),                     -- image, pdf, logo
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== SEED BASE ROLES ==========
INSERT INTO roles (name) VALUES ('super_admin'), ('admin'), ('editor'), ('viewer');