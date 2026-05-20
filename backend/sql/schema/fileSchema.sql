-- ============================================================
-- TELEMEDICINE PLATFORM — FILE & TAG SCHEMA
-- ============================================================
-- Run this after your users table is created
-- Requires: pgvector extension (for RAG chunks)
-- ============================================================

-- Enable pgvector extension (run once per database)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS vector;        -- for embeddings


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE file_category AS ENUM (
  'health_report',
  'prescription',
  'insurance',
  'identity',
  'scan_or_imaging',
  'other'
);

CREATE TYPE file_status AS ENUM (
  'uploaded',      -- file is in S3, no processing started
  'processing',    -- FastAPI is currently ingesting/analyzing
  'processed',     -- RAG ingestion + analysis complete
  'extracted',     -- prescription extraction complete
  'failed'         -- processing failed
);

CREATE TYPE file_type AS ENUM (
  'pdf',
  'image',
  'docx',
  'other'
);


-- ============================================================
-- CORE FILES TABLE
-- Universal registry for every file uploaded on the platform
-- ============================================================

CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- S3 info
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,                        -- original filename from upload
  file_key        TEXT NOT NULL UNIQUE,                 -- S3 object key (used for deletion)
  file_type       file_type NOT NULL DEFAULT 'other',
  mime_type       TEXT,                                 -- e.g. 'application/pdf', 'image/jpeg'
  file_size       BIGINT,                               -- size in bytes

  -- Classification
  category        file_category NOT NULL DEFAULT 'other',
  status          file_status NOT NULL DEFAULT 'uploaded',

  -- Flexible extra fields per category
  -- health_report: { lab_name, test_date, doctor_name }
  -- prescription:  { doctor_name, clinic_name, prescription_date }
  -- insurance:     { provider, policy_number, expiry_date }
  metadata        JSONB DEFAULT '{}',

  uploaded_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_files_user_id     ON files(user_id);
CREATE INDEX idx_files_category    ON files(category);
CREATE INDEX idx_files_status      ON files(status);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX idx_files_metadata    ON files USING GIN(metadata);


-- ============================================================
-- TAGS TABLE
-- Master list of all available tags
-- ============================================================

CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,   -- e.g. 'blood-test', 'cardiology', 'urgent'
  color       TEXT DEFAULT '#6B7280', -- hex color for UI badge
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed common medical tags
INSERT INTO tags (name, color) VALUES
  -- Report types
  ('blood-test',        '#EF4444'),
  ('lipid-panel',       '#F97316'),
  ('thyroid',           '#EAB308'),
  ('liver-function',    '#84CC16'),
  ('kidney-function',   '#06B6D4'),
  ('cbc',               '#3B82F6'),
  ('hba1c',             '#8B5CF6'),
  ('urine-analysis',    '#EC4899'),

  -- Specialties
  ('cardiology',        '#EF4444'),
  ('neurology',         '#8B5CF6'),
  ('orthopaedics',      '#F97316'),
  ('dermatology',       '#EC4899'),
  ('gastroenterology',  '#84CC16'),
  ('radiology',         '#6B7280'),

  -- Imaging
  ('mri',               '#0EA5E9'),
  ('x-ray',             '#64748B'),
  ('ultrasound',        '#06B6D4'),
  ('ct-scan',           '#475569'),

  -- Status tags (system assigned)
  ('unreviewed',        '#F59E0B'),
  ('reviewed',          '#10B981'),
  ('urgent',            '#DC2626'),
  ('follow-up',         '#7C3AED'),
  ('shared',            '#0284C7'),
  ('annual-checkup',    '#16A34A'),
  ('pre-surgery',       '#B45309');


-- ============================================================
-- FILE_TAGS JOIN TABLE
-- Many-to-many: files <-> tags
-- ============================================================

CREATE TABLE file_tags (
  file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  tagged_by   TEXT NOT NULL DEFAULT 'system',   -- 'system' | 'user'
  tagged_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (file_id, tag_id)
);

CREATE INDEX idx_file_tags_file_id ON file_tags(file_id);
CREATE INDEX idx_file_tags_tag_id  ON file_tags(tag_id);


-- ============================================================
-- REPORT CHUNKS TABLE
-- Stores text chunks + vector embeddings for RAG pipeline
-- Only populated for health_report and scan_or_imaging categories
-- ============================================================

CREATE TABLE report_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id       UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  chunk_text    TEXT NOT NULL,
  chunk_index   INT NOT NULL,        -- ordering within the report
  page_number   INT,                 -- which page the chunk came from
  embedding     vector(768),         -- google text-embedding-004 outputs 768 dims
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_chunks_file_id  ON report_chunks(file_id);
CREATE INDEX idx_report_chunks_embedding
  ON report_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);   -- tune lists = roughly sqrt(total expected rows)


-- ============================================================
-- REPORT ANALYSES TABLE
-- Stores structured Gemini analysis output for health reports
-- ============================================================

CREATE TABLE report_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id         UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  report_title    TEXT,
  urgency_level   TEXT,                -- 'low' | 'moderate' | 'high' | 'critical'
  summary         TEXT,
  findings_json   JSONB NOT NULL DEFAULT '{}',   -- full structured output from Gemini
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_analyses_file_id ON report_analyses(file_id);


-- ============================================================
-- PRESCRIPTIONS TABLE
-- Stores Gemini Vision extraction output for prescriptions
-- No chunks needed — extraction is a single-shot vision call
-- ============================================================

CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id         UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  extracted_json  JSONB NOT NULL DEFAULT '{}',
  -- extracted_json shape:
  -- {
  --   medicines: [{ name, dosage, frequency, duration }],
  --   recommended_tests: [...],
  --   advice: [...],
  --   doctor_notes: "..."
  -- }
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_file_id ON prescriptions(file_id);


-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();