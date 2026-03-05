-- ============================================================
-- Morgan Document Approvals — Digital Signature Workflow
-- Run this in your Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS morgan_document_approvals (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL,
  workspace_id         TEXT NOT NULL,

  doc_code             TEXT NOT NULL,           -- e.g. DOC-20260305-4231
  requestor_name       TEXT NOT NULL,
  department           TEXT NOT NULL,
  document_type        TEXT NOT NULL,           -- Contract / Archive / CRM / Finance
  purpose              TEXT NOT NULL,
  date_requested       DATE NOT NULL,
  approval_required_by DATE NOT NULL,
  urgency              TEXT NOT NULL DEFAULT 'standard', -- standard | moderate | critical

  additional_info      TEXT,
  file_name            TEXT,
  file_url             TEXT,                    -- Supabase storage public URL

  status               TEXT NOT NULL DEFAULT 'pending',  -- pending | under_review | approved | rejected
  review_notes         TEXT,
  approved_by          TEXT,
  approved_at          TIMESTAMPTZ,

  error_flags          TEXT,                    -- AI-detected issues
  ai_summary           TEXT,                    -- AI document brief

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Index for fast tenant queries
CREATE INDEX IF NOT EXISTS idx_doc_approvals_tenant
  ON morgan_document_approvals (user_id, workspace_id, created_at DESC);

-- RLS (same pattern as all other morgan tables)
ALTER TABLE morgan_document_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own doc approvals"
  ON morgan_document_approvals FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Service role bypass (used by admin API routes)
CREATE POLICY "Service role bypass doc approvals"
  ON morgan_document_approvals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Supabase storage bucket for document files
-- Run separately if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('document-approvals', 'document-approvals', false);
