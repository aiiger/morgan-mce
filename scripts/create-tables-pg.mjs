/**
 * Create missing tables via Supabase Management API
 * Uses the database's connection string pooler endpoint
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import pg from 'pg';

config({ path: join(process.cwd(), '.env.local') });

const projectRef = 'fgkqmleltfyuyigmtpqy';
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

// Supabase pooler connection string
const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

async function runWithPg() {
  const sql = readFileSync(join(process.cwd(), 'scripts', 'create-missing-tables.sql'), 'utf8');
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('✅ All 7 tables created via pg');
}

// If pg is not available, try fetch-based approach
async function runViaFetch() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Supabase exposes a management API at /rest/v1/
  // We can create a helper function via RPC first, then use it
  
  // Step 1: Create exec_sql function
  const createFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_text;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'apikey': key,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ sql_text: 'SELECT 1' }),
  });
  
  if (res.status === 404) {
    console.log('exec_sql RPC does not exist. Will need to create it first...');
    console.log('Please run this SQL in your Supabase SQL Editor first:');
    console.log(createFn);
    return false;
  }
  return true;
}

try {
  // Try pg driver first
  const { Client } = await import('pg').catch(() => ({ Client: null }));
  if (Client && dbPassword) {
    await runWithPg();
  } else {
    // Fallback: try creating exec_sql and using it
    const ok = await runViaFetch();
    if (!ok) {
      console.log('\n--- Alternative: Run SQL statements one at a time via individual table inserts ---');
      // We can use the PostgREST API to test if tables exist after manual creation
    }
  }
} catch (err) {
  console.error('Error:', err.message);
  console.log('\n⚠️  Please run the SQL manually in Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql`);
  console.log('   File: scripts/create-missing-tables.sql');
}
