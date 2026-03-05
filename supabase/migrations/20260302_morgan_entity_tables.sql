-- Morgan entity tables: tasks, issues, risks, milestones, documents, portfolios, timesheets
-- Follows same tenant-scoped pattern as 20260301_morgan_multitenant_persistence.sql
-- Reuses set_morgan_updated_at() trigger function from first migration.

-- ── Tasks ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_tasks (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  title text NOT NULL,
  description text,
  project text,
  assignee text,
  due text,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'To Do',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_tasks_tenant ON morgan_tasks(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_tasks_workspace ON morgan_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_tasks_tenant_created_at ON morgan_tasks(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_tasks_updated_at') THEN
    CREATE TRIGGER trg_morgan_tasks_updated_at
      BEFORE UPDATE ON morgan_tasks
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_tasks ENABLE ROW LEVEL SECURITY;

-- ── Issues ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_issues (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  title text NOT NULL,
  severity text NOT NULL DEFAULT 'Medium',
  project text,
  status text NOT NULL DEFAULT 'Open',
  assignee text,
  raised text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_issues_tenant ON morgan_issues(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_issues_workspace ON morgan_issues(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_issues_tenant_created_at ON morgan_issues(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_issues_updated_at') THEN
    CREATE TRIGGER trg_morgan_issues_updated_at
      BEFORE UPDATE ON morgan_issues
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_issues ENABLE ROW LEVEL SECURITY;

-- ── Risks ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_risks (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  title text NOT NULL,
  project text,
  category text NOT NULL DEFAULT 'Technical',
  probability text NOT NULL DEFAULT 'Medium',
  impact text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Open',
  owner text,
  raised text,
  mitigation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_risks_tenant ON morgan_risks(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_risks_workspace ON morgan_risks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_risks_tenant_created_at ON morgan_risks(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_risks_updated_at') THEN
    CREATE TRIGGER trg_morgan_risks_updated_at
      BEFORE UPDATE ON morgan_risks
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_risks ENABLE ROW LEVEL SECURITY;

-- ── Milestones ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_milestones (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  project text,
  due_date text,
  status text NOT NULL DEFAULT 'On Track',
  type text NOT NULL DEFAULT 'Phase Gate',
  owner text,
  progress integer NOT NULL DEFAULT 0,
  approval_status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_milestones_tenant ON morgan_milestones(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_milestones_workspace ON morgan_milestones(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_milestones_tenant_created_at ON morgan_milestones(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_milestones_updated_at') THEN
    CREATE TRIGGER trg_morgan_milestones_updated_at
      BEFORE UPDATE ON morgan_milestones
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_milestones ENABLE ROW LEVEL SECURITY;

-- ── Documents ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_documents (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  doc_type text NOT NULL DEFAULT 'PDF',
  size text,
  project text,
  category text NOT NULL DEFAULT 'General',
  author text,
  modified text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_documents_tenant ON morgan_documents(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_documents_workspace ON morgan_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_documents_tenant_created_at ON morgan_documents(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_documents_updated_at') THEN
    CREATE TRIGGER trg_morgan_documents_updated_at
      BEFORE UPDATE ON morgan_documents
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_documents ENABLE ROW LEVEL SECURITY;

-- ── Portfolios ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_portfolios (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  description text,
  project_count integer NOT NULL DEFAULT 0,
  total_budget numeric NOT NULL DEFAULT 0,
  health text NOT NULL DEFAULT 'Good',
  color text,
  manager text,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_portfolios_tenant ON morgan_portfolios(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_portfolios_workspace ON morgan_portfolios(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_portfolios_tenant_created_at ON morgan_portfolios(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_portfolios_updated_at') THEN
    CREATE TRIGGER trg_morgan_portfolios_updated_at
      BEFORE UPDATE ON morgan_portfolios
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_portfolios ENABLE ROW LEVEL SECURITY;

-- ── Timesheets ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS morgan_timesheets (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  employee text NOT NULL,
  project text,
  period text,
  hours numeric NOT NULL DEFAULT 0,
  overtime numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending',
  notes text,
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_timesheets_tenant ON morgan_timesheets(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_timesheets_workspace ON morgan_timesheets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_timesheets_tenant_created_at ON morgan_timesheets(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_timesheets_updated_at') THEN
    CREATE TRIGGER trg_morgan_timesheets_updated_at
      BEFORE UPDATE ON morgan_timesheets
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_timesheets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Morgan Templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS morgan_templates (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Project',
  description text,
  type text,
  version text DEFAULT '1.0',
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_templates_tenant ON morgan_templates(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_templates_workspace ON morgan_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_templates_tenant_created_at ON morgan_templates(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_templates_updated_at') THEN
    CREATE TRIGGER trg_morgan_templates_updated_at
      BEFORE UPDATE ON morgan_templates
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Morgan Meetings
-- ============================================================================
CREATE TABLE IF NOT EXISTS morgan_meetings (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  title text NOT NULL,
  date text NOT NULL,
  time text,
  attendees integer NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'One-time',
  location text,
  status text NOT NULL DEFAULT 'Scheduled',
  organizer text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_meetings_tenant ON morgan_meetings(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_meetings_workspace ON morgan_meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_meetings_tenant_created_at ON morgan_meetings(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_meetings_updated_at') THEN
    CREATE TRIGGER trg_morgan_meetings_updated_at
      BEFORE UPDATE ON morgan_meetings
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_meetings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Morgan Time Reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS morgan_time_reports (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  date text NOT NULL,
  project text NOT NULL,
  description text,
  hours numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending',
  employee text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_time_reports_tenant ON morgan_time_reports(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_time_reports_workspace ON morgan_time_reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_time_reports_tenant_created_at ON morgan_time_reports(user_id, workspace_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_morgan_time_reports_updated_at') THEN
    CREATE TRIGGER trg_morgan_time_reports_updated_at
      BEFORE UPDATE ON morgan_time_reports
      FOR EACH ROW EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_time_reports ENABLE ROW LEVEL SECURITY;
