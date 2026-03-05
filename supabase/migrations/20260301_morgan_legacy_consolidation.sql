-- Morgan legacy consolidation for tenders + document/contract linkage

CREATE TABLE IF NOT EXISTS morgan_tender_document_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  legacy_tender_id uuid,
  morgan_tender_id text REFERENCES morgan_tenders(id) ON DELETE SET NULL,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  link_reason text NOT NULL DEFAULT 'title_match',
  source_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_morgan_tender_doc_links_tenant
  ON morgan_tender_document_links(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_morgan_tender_doc_links_morgan_tender
  ON morgan_tender_document_links(morgan_tender_id);

ALTER TABLE morgan_tender_document_links ENABLE ROW LEVEL SECURITY;

-- Intentionally no broad policies: server routes/scripts use service role.
