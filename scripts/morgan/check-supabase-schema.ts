import path from 'path';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
dotenv.config({ quiet: true });

const REQUIRED_TABLES = [
  'morgan_projects',
  'morgan_tenders',
  'morgan_workflows',
  'morgan_automations',
  'morgan_automation_execution_history'
] as const;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function checkTable(client: SupabaseClient, table: string): Promise<{ ok: boolean; message?: string }> {
  const { error } = await (client as any).from(table).select('id').limit(1);

  if (!error) {
    return { ok: true };
  }

  return {
    ok: false,
    message: error.message
  };
}

async function run() {
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    console.error('Missing Supabase environment variables.');
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or shell.');
    process.exit(1);
  }

  const missing: Array<{ table: string; reason?: string }> = [];

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(supabaseAdmin, table);
    if (!result.ok) {
      missing.push({ table, reason: result.message });
    }
  }

  if (missing.length) {
    console.error('Morgan schema check failed. Missing/unavailable tables:');
    for (const entry of missing) {
      console.error(`- ${entry.table}${entry.reason ? `: ${entry.reason}` : ''}`);
    }
    console.error('Apply supabase/migrations/20260301_morgan_multitenant_persistence.sql and re-run this check.');
    process.exit(1);
  }

  console.log('Morgan schema check passed. All required Supabase tables are available.');
}

run().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
