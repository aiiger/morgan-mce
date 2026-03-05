import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const tables = [
  {
    name: 'morgan_expenses',
    sql: `CREATE TABLE IF NOT EXISTS morgan_expenses (
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
    )`
  },
  {
    name: 'morgan_budgets',
    sql: `CREATE TABLE IF NOT EXISTS morgan_budgets (
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
    )`
  },
  {
    name: 'morgan_financial_approvals',
    sql: `CREATE TABLE IF NOT EXISTS morgan_financial_approvals (
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
    )`
  },
  {
    name: 'morgan_resource_requests',
    sql: `CREATE TABLE IF NOT EXISTS morgan_resource_requests (
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
    )`
  },
  {
    name: 'morgan_alert_rules',
    sql: `CREATE TABLE IF NOT EXISTS morgan_alert_rules (
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
    )`
  },
  {
    name: 'morgan_lessons_learned',
    sql: `CREATE TABLE IF NOT EXISTS morgan_lessons_learned (
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
    )`
  },
  {
    name: 'morgan_settings',
    sql: `CREATE TABLE IF NOT EXISTS morgan_settings (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      workspace_id text NOT NULL DEFAULT 'default',
      key text,
      value jsonb DEFAULT '{}'::jsonb,
      theme text DEFAULT 'dark',
      notifications_enabled boolean DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`
  }
];

for (const t of tables) {
  const { error } = await sb.rpc('exec_sql', { sql_text: t.sql });
  if (error) {
    console.log(`❌ ${t.name}: ${error.message}`);
  } else {
    console.log(`✅ ${t.name} created`);
    // Add tenant index
    await sb.rpc('exec_sql', { sql_text: `CREATE INDEX IF NOT EXISTS idx_${t.name}_tenant ON ${t.name}(user_id, workspace_id)` });
    // Enable RLS
    await sb.rpc('exec_sql', { sql_text: `ALTER TABLE ${t.name} ENABLE ROW LEVEL SECURITY` });
  }
}

// Verify all
console.log('\n--- Verification ---');
for (const t of tables) {
  const { error } = await sb.from(t.name).select('id').limit(0);
  console.log(`${t.name}: ${error ? '❌ ' + error.message : '✅ exists'}`);
}
