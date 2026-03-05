/**
 * Standalone seed script — pushes morgan-backbone-store.json into Supabase
 * using the service role key directly. No Next.js, no Clerk, no middleware.
 *
 * Usage:  node scripts/seed-store-to-supabase.mjs
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function toNumber(value, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function upsert(table, rows) {
  if (!rows.length) { console.log(`  ⏭  ${table}: 0 rows (skip)`); return 0; }
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error(`  ❌ ${table}: ${error.message}`);
    throw error;
  }
  console.log(`  ✅ ${table}: ${rows.length} rows`);
  return rows.length;
}

// ── Resolve the real Clerk user ID ─────────────────────────────────────
// We query the existing morgan_projects table to see if there's already a
// user_id that's NOT "public". If so we reuse it. Otherwise we ask.
async function resolveUserId() {
  const { data } = await supabase
    .from('morgan_projects')
    .select('user_id')
    .neq('user_id', 'public')
    .limit(1);

  if (data && data.length > 0) {
    return data[0].user_id;
  }

  // Fallback: check morgan_tenders
  const { data: td } = await supabase
    .from('morgan_tenders')
    .select('user_id')
    .neq('user_id', 'public')
    .limit(1);

  if (td && td.length > 0) {
    return td[0].user_id;
  }

  // Last resort: check clerk session from request (not available here).
  // Just query the Clerk user from the Clerk-managed users table if it exists.
  // Or use Clerk's backend API: list users
  const clerkKey = process.env.CLERK_SECRET_KEY;
  if (clerkKey) {
    try {
      const res = await fetch('https://api.clerk.com/v1/users?limit=1&order_by=-created_at', {
        headers: { Authorization: `Bearer ${clerkKey}` },
      });
      const users = await res.json();
      if (Array.isArray(users) && users.length > 0) {
        return users[0].id;
      }
    } catch { /* ignore */ }
  }

  return null;
}

async function run() {
  console.log('🔍 Resolving user ID...');
  const userId = await resolveUserId();

  if (!userId) {
    console.error('❌ Could not determine your Clerk user ID.');
    console.error('   Please provide it as: CLERK_USER_ID=user_xxxxx node scripts/seed-store-to-supabase.mjs');
    console.error('   (Find it in Clerk dashboard → Users → click your user → copy ID)');
    process.exit(1);
  }

  const workspaceId = 'default';
  console.log(`📋 Using userId: ${userId}, workspaceId: ${workspaceId}\n`);

  // Read the JSON store
  const storePath = join(process.cwd(), 'data_exports', 'morgan-backbone-store.json');
  const raw = readFileSync(storePath, 'utf8');
  const parsed = JSON.parse(raw);

  const allProjects = [];
  const allTenders = [];
  const allWorkflows = [];
  const allAutomations = [];

  const tenants = parsed.tenants ?? { default: parsed };

  for (const store of Object.values(tenants)) {
    for (const row of store.projects ?? []) {
      allProjects.push({
        id: row.id,
        user_id: userId,
        workspace_id: workspaceId,
        name: row.name,
        code: row.code,
        portfolio: row.portfolio,
        priority: row.priority,
        status: row.status,
        value: toNumber(row.value, 0),
        progress: toNumber(row.progress, 0),
        payment_due_at: row.paymentDueAt || null,
        dlp_end_at: row.dlpEndAt || null,
        milestone_due_at: row.milestoneDueAt || null,
        created_at: row.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    for (const row of store.tenders ?? []) {
      allTenders.push({
        id: row.id,
        user_id: userId,
        workspace_id: workspaceId,
        name: row.name,
        value: toNumber(row.value, 0),
        status: row.status,
        compliance: toNumber(row.compliance, 0),
        deadline_at: row.deadlineAt || null,
        owner: row.owner || null,
        created_at: row.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    for (const row of store.workflows ?? []) {
      allWorkflows.push({
        id: row.id,
        user_id: userId,
        workspace_id: workspaceId,
        name: row.name,
        description: row.description || null,
        status: row.status || 'ACTIVE',
        created_at: row.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    for (const row of store.automations ?? []) {
      allAutomations.push({
        id: row.id,
        user_id: userId,
        workspace_id: workspaceId,
        workflow_id: row.workflowId || null,
        name: row.name,
        description: row.description || null,
        status: row.status || 'ACTIVE',
        created_at: row.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Deduplicate by id (last wins)
  const dedup = (arr) => [...new Map(arr.map(r => [r.id, r])).values()];

  console.log('📤 Upserting to Supabase...\n');

  await upsert('morgan_projects', dedup(allProjects));
  await upsert('morgan_tenders', dedup(allTenders));
  await upsert('morgan_workflows', dedup(allWorkflows));
  await upsert('morgan_automations', dedup(allAutomations));

  console.log('\n✅ Seed complete! Refresh your browser to see data.');
}

run().catch((err) => {
  console.error('\n💥 Fatal:', err.message || err);
  process.exit(1);
});
