import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) { console.error('Missing env vars'); process.exit(1); }

const supabase = createClient(url, key, { auth: { persistSession: false } });

const statements = [
  `CREATE TABLE IF NOT EXISTS morgan_proposals (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title text NOT NULL,
    client text,
    value numeric DEFAULT 0,
    stage text NOT NULL DEFAULT 'Draft',
    probability int DEFAULT 0,
    due_date timestamptz,
    owner text,
    description text,
    user_id text NOT NULL,
    workspace_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE morgan_proposals ENABLE ROW LEVEL SECURITY`,
  `CREATE INDEX IF NOT EXISTS idx_morgan_proposals_tenant ON morgan_proposals(user_id, workspace_id)`,
  `CREATE TABLE IF NOT EXISTS morgan_time_off (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_name text NOT NULL,
    type text NOT NULL DEFAULT 'Annual Leave',
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    days int DEFAULT 1,
    status text NOT NULL DEFAULT 'Pending',
    notes text,
    user_id text NOT NULL,
    workspace_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE morgan_time_off ENABLE ROW LEVEL SECURITY`,
  `CREATE INDEX IF NOT EXISTS idx_morgan_time_off_tenant ON morgan_time_off(user_id, workspace_id)`,
];

for (const sql of statements) {
  const { error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({ error: { message: 'rpc not available' } }));
  if (error) {
    // Fall back to raw HTTP to the pg endpoint
    const res = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ query: sql }),
    });
    const text = await res.text();
    console.log(res.ok ? '✅' : '❌', sql.slice(0, 60).replace(/\s+/g, ' '), '->', text.slice(0, 120));
  } else {
    console.log('✅', sql.slice(0, 60).replace(/\s+/g, ' '));
  }
}

console.log('\nDone. Verifying tables exist...');
const { data: proposals } = await supabase.from('morgan_proposals').select('id').limit(1);
const { data: timeoff } = await supabase.from('morgan_time_off').select('id').limit(1);
console.log('morgan_proposals:', proposals !== null ? 'EXISTS ✅' : 'MISSING ❌');
console.log('morgan_time_off: ', timeoff !== null ? 'EXISTS ✅' : 'MISSING ❌');
