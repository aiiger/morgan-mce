-- Morgan multi-tenant durable persistence for Vercel deployment
-- Standard: strict tenant scoping via (user_id, workspace_id) and API-enforced auth boundaries.

CREATE TABLE IF NOT EXISTS morgan_projects (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  portfolio text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  progress integer NOT NULL DEFAULT 0,
  payment_due_at timestamptz,
  dlp_end_at timestamptz,
  milestone_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_projects_tenant ON morgan_projects(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_projects_workspace ON morgan_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_projects_tenant_created_at ON morgan_projects(user_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS morgan_tenders (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  status text NOT NULL,
  compliance integer NOT NULL DEFAULT 0,
  deadline_at timestamptz,
  owner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_tenders_tenant ON morgan_tenders(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_tenders_workspace ON morgan_tenders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_tenders_tenant_created_at ON morgan_tenders(user_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS morgan_workflows (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_workflows_tenant ON morgan_workflows(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_workflows_workspace ON morgan_workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_workflows_tenant_created_at ON morgan_workflows(user_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS morgan_automations (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  workflow_id text REFERENCES morgan_workflows(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_automations_tenant ON morgan_automations(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_automations_workspace ON morgan_automations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_automations_tenant_created_at ON morgan_automations(user_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS morgan_automation_execution_history (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL,
  rule_id text NOT NULL REFERENCES morgan_automations(id) ON DELETE CASCADE,
  event text NOT NULL,
  state text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morgan_automation_history_tenant ON morgan_automation_execution_history(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_morgan_automation_history_rule ON morgan_automation_execution_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_morgan_automation_history_tenant_rule_created_at ON morgan_automation_execution_history(user_id, workspace_id, rule_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_morgan_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_morgan_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_morgan_projects_updated_at
      BEFORE UPDATE ON morgan_projects
      FOR EACH ROW
      EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_morgan_tenders_updated_at'
  ) THEN
    CREATE TRIGGER trg_morgan_tenders_updated_at
      BEFORE UPDATE ON morgan_tenders
      FOR EACH ROW
      EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_morgan_workflows_updated_at'
  ) THEN
    CREATE TRIGGER trg_morgan_workflows_updated_at
      BEFORE UPDATE ON morgan_workflows
      FOR EACH ROW
      EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_morgan_automations_updated_at'
  ) THEN
    CREATE TRIGGER trg_morgan_automations_updated_at
      BEFORE UPDATE ON morgan_automations
      FOR EACH ROW
      EXECUTE FUNCTION set_morgan_updated_at();
  END IF;
END $$;

ALTER TABLE morgan_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE morgan_tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE morgan_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE morgan_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE morgan_automation_execution_history ENABLE ROW LEVEL SECURITY;

-- Intentionally no broad policies: API server uses service role; direct client access remains denied by default.
