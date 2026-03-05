/**
 * Create missing tables by connecting to Supabase's Postgres
 * via the Transaction API (pg-meta endpoint at /pg)
 * or via direct pooler connection.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import pg from 'pg';

config({ path: join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = 'fgkqmleltfyuyigmtpqy';

const sql = readFileSync(join(process.cwd(), 'scripts', 'create-missing-tables.sql'), 'utf8');

// Decode the JWT service role key to get the database password
// The Supabase pooler allows connecting with the service_role JWT as password
async function runViaPg() {
  // Supabase session-mode pooler on port 5432, transaction-mode on 6543
  // Use the service role key as the password via supavisor
  const connStr = `postgresql://postgres.${projectRef}:${serviceKey}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`;
  
  console.log('Connecting to Supabase Postgres via pooler...');
  const client = new pg.Client({ connectionString: connStr });
  
  try {
    await client.connect();
    console.log('Connected! Running SQL...');
    await client.query(sql);
    console.log('✅ All 7 tables created successfully!');
  } finally {
    await client.end();
  }
}

// Try different pooler regions
const regions = [
  'aws-0-eu-west-1',
  'aws-0-us-east-1', 
  'aws-0-us-west-1',
  'aws-0-ap-southeast-1',
];

let success = false;

for (const region of regions) {
  if (success) break;
  
  const connStr = `postgresql://postgres.${projectRef}:${serviceKey}@${region}.pooler.supabase.com:5432/postgres?sslmode=require`;
  console.log(`Trying ${region}...`);
  
  const client = new pg.Client({ connectionString: connStr });
  
  try {
    await client.connect();
    console.log(`Connected via ${region}! Running SQL...`);
    await client.query(sql);
    console.log('✅ All 7 tables created successfully!');
    success = true;
    await client.end();
  } catch (err) {
    console.log(`  ❌ ${err.message.substring(0, 80)}`);
    try { await client.end(); } catch {}
  }
}

if (!success) {
  // Try direct database connection (port 5432 on the project host)
  const directConn = `postgresql://postgres:${serviceKey}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
  console.log('Trying direct connection...');
  const client = new pg.Client({ connectionString: directConn });
  
  try {
    await client.connect();
    console.log('Connected directly! Running SQL...');
    await client.query(sql);
    console.log('✅ All 7 tables created successfully!');
    success = true;
    await client.end();
  } catch (err) {
    console.log(`  ❌ ${err.message.substring(0, 80)}`);
    try { await client.end(); } catch {}
  }
}

if (!success) {
  console.log('\n⚠️  Could not connect automatically.');
  console.log('Please run the SQL in your Supabase SQL Editor:');
  console.log(`https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('File: scripts/create-missing-tables.sql');
}
