import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
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
`;

// Use the Supabase SQL endpoint directly (pg-meta REST API)
const projectRef = new URL(url).hostname.split('.')[0]; // fgkqmleltfyuyigmtpqy
const sqlUrl = `${url}/rest/v1/rpc/`;

// Alternative: use the pg endpoint through the service role with raw SQL
// Supabase exposes a /pg endpoint for running raw SQL if pg-meta extension is installed
// But the simplest approach: use the management API

// Try the /sql endpoint that's part of newer Supabase
const endpoints = [
  `https://${projectRef}.supabase.co/pg/query`,
  `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`,
];

let success = false;

// Method 1: Try /pg/query (available in newer Supabase)
try {
  const res = await fetch(`${url}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'apikey': key,
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (res.ok) {
    console.log('✅ Tables created via /pg/query');
    success = true;
  } else {
    console.log(`/pg/query failed (${res.status}): ${text.substring(0, 200)}`);
  }
} catch (e) {
  console.log('/pg/query error:', e.message);
}

if (!success) {
  console.log('\n⚠️  Cannot run SQL directly. Please run this SQL in your Supabase Dashboard:');
  console.log('   → Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql');
  console.log('   → Copy-paste the SQL from: scripts/create-missing-tables.sql');
  console.log('\nGenerating .sql file...');
}
