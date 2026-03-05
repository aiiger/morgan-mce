import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
dotenv.config({ quiet: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;

interface LegacyStore {
  projects?: any[];
  tenders?: any[];
  workflows?: any[];
  automations?: any[];
  automationExecutionHistory?: any[];
}

interface TenantStoreFile {
  version?: number;
  tenants?: Record<string, LegacyStore>;
}

const storePath = path.join(process.cwd(), 'data_exports', 'morgan-backbone-store.json');

function toNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toTenant(tenantId: string): { userId: string; workspaceId: string } {
  const [userId, workspaceId] = tenantId.split(':');
  return {
    userId: userId || 'public',
    workspaceId: workspaceId || 'default'
  };
}

async function upsertRows(table: string, rows: any[]) {
  if (!rows.length) return;
  const { error } = await (supabaseAdmin as any).from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

async function run() {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required to run migration.');
  }

  const raw = await fs.readFile(storePath, 'utf8');
  const parsed = JSON.parse(raw) as TenantStoreFile | LegacyStore;

  const tenants: Record<string, LegacyStore> = (parsed as TenantStoreFile).tenants
    ? (parsed as TenantStoreFile).tenants!
    : { 'public:default': parsed as LegacyStore };

  for (const [tenantId, store] of Object.entries(tenants)) {
    const { userId, workspaceId } = toTenant(tenantId);

    const projects = (store.projects || []).map((row) => ({
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
      payment_due_at: row.paymentDueAt,
      dlp_end_at: row.dlpEndAt,
      milestone_due_at: row.milestoneDueAt,
      created_at: row.createdAt || new Date().toISOString(),
      updated_at: row.updatedAt || new Date().toISOString()
    }));

    const tenders = (store.tenders || []).map((row) => ({
      id: row.id,
      user_id: userId,
      workspace_id: workspaceId,
      name: row.name,
      value: toNumber(row.value, 0),
      status: row.status,
      compliance: toNumber(row.compliance, 0),
      deadline_at: row.deadlineAt,
      owner: row.owner,
      created_at: row.createdAt || new Date().toISOString(),
      updated_at: row.updatedAt || new Date().toISOString()
    }));

    const workflows = (store.workflows || []).map((row) => ({
      id: row.id,
      user_id: userId,
      workspace_id: row.workspaceId || workspaceId,
      name: row.name,
      description: row.description || null,
      status: row.status || 'ACTIVE',
      created_at: row.createdAt || new Date().toISOString(),
      updated_at: row.updatedAt || new Date().toISOString()
    }));

    const automations = (store.automations || []).map((row) => ({
      id: row.id,
      user_id: userId,
      workspace_id: workspaceId,
      workflow_id: row.workflowId || null,
      name: row.name,
      description: row.description || null,
      status: row.status || 'ACTIVE',
      created_at: row.createdAt || new Date().toISOString(),
      updated_at: row.updatedAt || new Date().toISOString()
    }));

    const history = (store.automationExecutionHistory || []).map((row) => ({
      id: row.id,
      user_id: userId,
      workspace_id: workspaceId,
      rule_id: row.ruleId,
      event: row.event,
      state: row.state,
      created_at: row.createdAt || new Date().toISOString()
    }));

    await upsertRows('morgan_projects', projects);
    await upsertRows('morgan_tenders', tenders);
    await upsertRows('morgan_workflows', workflows);
    await upsertRows('morgan_automations', automations);
    await upsertRows('morgan_automation_execution_history', history);

    console.log(`Migrated tenant ${tenantId}: projects=${projects.length}, tenders=${tenders.length}, workflows=${workflows.length}, automations=${automations.length}, history=${history.length}`);
  }

  console.log('Migration complete.');
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
