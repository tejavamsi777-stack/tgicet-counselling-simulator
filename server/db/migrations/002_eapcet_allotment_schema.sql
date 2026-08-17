-- -----------------------------------------------------------------------------
-- TG EAPCET / TS EAMCET 10+ Year Official Allotment Records & Ingestion Schema
-- -----------------------------------------------------------------------------

-- 1. Raw Import Audit Log Table
CREATE TABLE IF NOT EXISTS raw_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    exam_id VARCHAR(50) NOT NULL DEFAULT 'tg-eapcet',
    historical_exam_name VARCHAR(100) NOT NULL DEFAULT 'TG EAPCET',
    admission_year INTEGER NOT NULL,
    phase VARCHAR(50) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    new_records INTEGER NOT NULL DEFAULT 0,
    duplicate_records INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    error_details TEXT,
    imported_by VARCHAR(100) DEFAULT 'system_admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Official Candidate-Level Allotment Records Table
CREATE TABLE IF NOT EXISTS eapcet_allotment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_import_id UUID REFERENCES raw_import_logs(id) ON DELETE SET NULL,
    exam_id VARCHAR(50) NOT NULL DEFAULT 'tg-eapcet',
    historical_exam_name VARCHAR(100) NOT NULL DEFAULT 'TG EAPCET',
    admission_year INTEGER NOT NULL,
    phase VARCHAR(50) NOT NULL,
    college_code VARCHAR(50) NOT NULL,
    college_name TEXT NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    branch_name TEXT NOT NULL,
    rank INTEGER NOT NULL,
    roll_no VARCHAR(100) NOT NULL,
    candidate_name TEXT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    region VARCHAR(50) NOT NULL DEFAULT 'OU',
    caste VARCHAR(50) NOT NULL DEFAULT 'OC',
    seat_category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_allotment_record UNIQUE (admission_year, phase, college_code, branch_code, roll_no)
);

-- 3. High-Performance B-Tree Indexes for Instant Lookups (<50ms)
CREATE INDEX IF NOT EXISTS idx_eapcet_allotments_lookup 
    ON eapcet_allotment_records (admission_year, phase, college_code, branch_code);

CREATE INDEX IF NOT EXISTS idx_eapcet_allotments_rank 
    ON eapcet_allotment_records (rank);

CREATE INDEX IF NOT EXISTS idx_eapcet_allotments_category 
    ON eapcet_allotment_records (caste, seat_category);

CREATE INDEX IF NOT EXISTS idx_eapcet_allotments_gender 
    ON eapcet_allotment_records (gender);

CREATE INDEX IF NOT EXISTS idx_eapcet_allotments_exam 
    ON eapcet_allotment_records (exam_id, admission_year);
