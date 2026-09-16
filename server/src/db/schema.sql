-- Core DDL Schema for AI-Enabled MoTA Scholarship & Fellowship Management System

CREATE TABLE IF NOT EXISTS schemes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  legacy_portal TEXT NOT NULL,
  income_ceiling REAL,
  age_ceiling REAL,
  academic_threshold REAL,
  quota_type TEXT NOT NULL, -- UNCAPPED | FIXED_SLOTS
  total_slots INTEGER,
  selection_method TEXT NOT NULL, -- AUTO_GATE | MERIT_WATERFALL | TIERED_PRIORITY
  reservation_waterfall TEXT NOT NULL, -- JSON array of WaterfallTierConfig
  document_checklist TEXT NOT NULL, -- JSON array of DocumentChecklistItem
  verification_hierarchy TEXT NOT NULL, -- JSON array of tiers
  disbursement_frequency TEXT NOT NULL, -- ANNUAL | QUARTERLY | SEMESTER_FOREX
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  aadhaar_masked TEXT NOT NULL,
  aadhaar_hash TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- PVTG | DIVYANGJAN | FEMALE_ST | ST_OTHER
  is_pwd INTEGER NOT NULL DEFAULT 0,
  is_pvtg INTEGER NOT NULL DEFAULT 0,
  gender TEXT NOT NULL, -- FEMALE | MALE | OTHER
  annual_income REAL NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  institute_name TEXT NOT NULL,
  course_level TEXT NOT NULL,
  academic_percentage REAL NOT NULL,
  bank_account_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  applicant_id TEXT NOT NULL,
  scheme_id TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL, -- DRAFT | SUBMITTED | UNDER_SCRUTINY | DEFICIENCY_FLAGGED | RESUBMITTED | VERIFIED | SHORTLISTED | SELECTED | REJECTED | DISBURSED
  current_stage TEXT NOT NULL,
  submitted_at TEXT,
  form_data TEXT NOT NULL, -- JSON
  explainable_status TEXT NOT NULL,
  deficiency_reason TEXT,
  ai_discrepancy_score REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (applicant_id) REFERENCES applicants(id),
  FOREIGN KEY (scheme_id) REFERENCES schemes(id)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  ocr_extracted TEXT, -- JSON
  status TEXT NOT NULL, -- PENDING_OCR | OCR_VERIFIED | DEFICIENCY_FLAGGED | RESUBMISSION_PENDING | ACCEPTED
  discrepancy_note TEXT,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS verification_stages (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  action TEXT NOT NULL, -- APPROVED | FLAGGED_DEFICIENCY | REJECTED | FORWARDED
  comments TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS selection_records (
  id TEXT PRIMARY KEY,
  scheme_id TEXT NOT NULL,
  application_id TEXT NOT NULL,
  applicant_id TEXT NOT NULL,
  quota_tier TEXT NOT NULL,
  original_tier TEXT NOT NULL,
  is_spillover INTEGER NOT NULL DEFAULT 0,
  merit_rank INTEGER,
  priority_tier INTEGER,
  qs_rank INTEGER,
  university_name TEXT,
  committee_signed_off INTEGER NOT NULL DEFAULT 0,
  signed_off_at TEXT,
  disbursement_amount_inr REAL NOT NULL,
  status TEXT NOT NULL, -- PROVISIONAL | CONFIRMED | REJECTED
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (scheme_id) REFERENCES schemes(id),
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (applicant_id) REFERENCES applicants(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS qs_universities (
  rank INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL
);

-- Indexes for performance & deduplication checking
CREATE INDEX IF NOT EXISTS idx_applicants_aadhaar ON applicants(aadhaar_hash);
CREATE INDEX IF NOT EXISTS idx_applicants_bank ON applicants(bank_account_hash);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_app ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
