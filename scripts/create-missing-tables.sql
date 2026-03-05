-- MCE Command Center: Create 9 missing tables
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fgkqmleltfyuyigmtpqy/sql

-- 1. morgan_expenses
CREATE TABLE IF NOT EXISTS morgan_expenses (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  project_id text,
  name text NOT NULL DEFAULT 'Untitled Expense',
  amount numeric NOT NULL DEFAULT 0,
  category text DEFAULT 'General',
  status text DEFAULT 'Pending',
  date timestamptz,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_expenses_tenant ON morgan_expenses(user_id, workspace_id);
ALTER TABLE morgan_expenses ENABLE ROW LEVEL SECURITY;

-- 2. morgan_budgets
CREATE TABLE IF NOT EXISTS morgan_budgets (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  project_id text,
  name text NOT NULL DEFAULT 'Untitled Budget',
  total_amount numeric NOT NULL DEFAULT 0,
  allocated numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  category text DEFAULT 'General',
  status text DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_budgets_tenant ON morgan_budgets(user_id, workspace_id);
ALTER TABLE morgan_budgets ENABLE ROW LEVEL SECURITY;

-- 3. morgan_financial_approvals
CREATE TABLE IF NOT EXISTS morgan_financial_approvals (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  project_id text,
  name text NOT NULL DEFAULT 'Untitled Approval',
  amount numeric NOT NULL DEFAULT 0,
  requester text,
  approver text,
  status text DEFAULT 'Pending',
  priority text DEFAULT 'Medium',
  request_date timestamptz,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_financial_approvals_tenant ON morgan_financial_approvals(user_id, workspace_id);
ALTER TABLE morgan_financial_approvals ENABLE ROW LEVEL SECURITY;

-- 4. morgan_resource_requests
CREATE TABLE IF NOT EXISTS morgan_resource_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  project_id text,
  name text NOT NULL DEFAULT 'Untitled Request',
  resource_type text DEFAULT 'Personnel',
  quantity integer DEFAULT 1,
  status text DEFAULT 'Pending',
  priority text DEFAULT 'Medium',
  requester text,
  description text,
  needed_by timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_resource_requests_tenant ON morgan_resource_requests(user_id, workspace_id);
ALTER TABLE morgan_resource_requests ENABLE ROW LEVEL SECURITY;

-- 5. morgan_alert_rules
CREATE TABLE IF NOT EXISTS morgan_alert_rules (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  name text NOT NULL DEFAULT 'Untitled Alert Rule',
  entity_type text DEFAULT 'project',
  condition_field text,
  condition_operator text DEFAULT 'equals',
  condition_value text,
  severity text DEFAULT 'Medium',
  enabled boolean DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_alert_rules_tenant ON morgan_alert_rules(user_id, workspace_id);
ALTER TABLE morgan_alert_rules ENABLE ROW LEVEL SECURITY;

-- 6. morgan_lessons_learned
CREATE TABLE IF NOT EXISTS morgan_lessons_learned (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  project_id text,
  title text NOT NULL DEFAULT 'Untitled Lesson',
  category text DEFAULT 'General',
  impact text DEFAULT 'Medium',
  description text,
  recommendation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_lessons_learned_tenant ON morgan_lessons_learned(user_id, workspace_id);
ALTER TABLE morgan_lessons_learned ENABLE ROW LEVEL SECURITY;

-- 7. morgan_settings
CREATE TABLE IF NOT EXISTS morgan_settings (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  key text,
  value jsonb DEFAULT '{}'::jsonb,
  theme text DEFAULT 'dark',
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_settings_tenant ON morgan_settings(user_id, workspace_id);
ALTER TABLE morgan_settings ENABLE ROW LEVEL SECURITY;

-- 8. morgan_invoices
CREATE TABLE IF NOT EXISTS morgan_invoices (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  project_id text,
  invoice_number text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  due_date timestamptz,
  status text DEFAULT 'Draft',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_invoices_tenant ON morgan_invoices(user_id, workspace_id);
ALTER TABLE morgan_invoices ENABLE ROW LEVEL SECURITY;

-- 9. morgan_resources
CREATE TABLE IF NOT EXISTS morgan_resources (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  workspace_id text NOT NULL DEFAULT 'default',
  name text NOT NULL DEFAULT '',
  role text DEFAULT '',
  department text DEFAULT 'Projects',
  hourly_rate numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_morgan_resources_tenant ON morgan_resources(user_id, workspace_id);
ALTER TABLE morgan_resources ENABLE ROW LEVEL SECURITY;
