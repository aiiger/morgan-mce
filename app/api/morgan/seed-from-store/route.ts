/**
 * ONE-TIME seed endpoint: reads data_exports/morgan-backbone-store.json and
 * upserts all rows into Supabase using the authenticated user's real Clerk ID.
 *
 * POST /api/morgan/seed-from-store
 *   → { seeded: { projects, tenders, workflows, automations } }
 *
 * Safe to call multiple times (uses upsert).
 * DELETE this route once data is confirmed in Supabase.
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/admin';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return 0;
  const sb = createClient();
  const { error } = await (sb as any).from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
  return rows.length;
}

export async function POST(request: Request) {
  try {
    // Step 1: Resolve tenant
    let userId: string;
    let workspaceId: string;
    try {
      const tenant = await resolveMorganTenantContext(request);
      console.log('[seed] tenant result:', JSON.stringify({ ok: tenant.ok, status: tenant.status, error: tenant.error, context: tenant.context }));
      if (!tenant.ok || !tenant.context) {
        return NextResponse.json({ error: tenant.error, step: 'auth' }, { status: tenant.status ?? 401 });
      }
      userId = tenant.context.userId;
      workspaceId = tenant.context.workspaceId;
    } catch (authErr) {
      console.error('[seed] auth error:', authErr);
      return NextResponse.json({ error: String(authErr), step: 'auth' }, { status: 500 });
    }

    // Step 2: Read file store
    const storePath = path.join(process.cwd(), 'data_exports', 'morgan-backbone-store.json');
    console.log('[seed] Reading store from:', storePath);
    let raw: string;
    try {
      raw = await fs.readFile(storePath, 'utf8');
    } catch (fileErr) {
      console.error('[seed] file read error:', fileErr);
      return NextResponse.json({ error: `Cannot read store file: ${fileErr}`, step: 'file-read', path: storePath }, { status: 500 });
    }

    const parsed = JSON.parse(raw) as {
      version?: number;
      tenants?: Record<string, {
        projects?: any[];
        tenders?: any[];
        workflows?: any[];
        automations?: any[];
        automationExecutionHistory?: any[];
      }>;
    };

    // Collect all rows across all tenants — re-stamp with real auth'd user
    const allProjects: any[] = [];
    const allTenders: any[] = [];
    const allWorkflows: any[] = [];
    const allAutomations: any[] = [];

    const tenants = parsed.tenants ?? { default: parsed as any };

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
          updated_at: row.updatedAt || new Date().toISOString(),
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
          updated_at: row.updatedAt || new Date().toISOString(),
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
          updated_at: row.updatedAt || new Date().toISOString(),
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
          updated_at: row.updatedAt || new Date().toISOString(),
        });
      }
    }

    console.log('[seed] Upserting — projects:', allProjects.length, 'tenders:', allTenders.length, 'workflows:', allWorkflows.length, 'automations:', allAutomations.length);
    console.log('[seed] userId:', userId, 'workspaceId:', workspaceId);

    const results: Record<string, number> = {};
    for (const [table, rows] of [
      ['morgan_projects', allProjects],
      ['morgan_tenders', allTenders],
      ['morgan_workflows', allWorkflows],
      ['morgan_automations', allAutomations],
    ] as [string, any[]][]) {
      try {
        results[table] = await upsert(table, rows);
      } catch (upsertErr) {
        console.error(`[seed] upsert ${table} failed:`, upsertErr);
        return NextResponse.json({ error: String(upsertErr), step: `upsert-${table}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      userId,
      workspaceId,
      seeded: {
        projects: results['morgan_projects'] ?? 0,
        tenders: results['morgan_tenders'] ?? 0,
        workflows: results['morgan_workflows'] ?? 0,
        automations: results['morgan_automations'] ?? 0,
      },
    });

  } catch (err) {
    console.error('[seed-from-store]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Seed failed' }, { status: 500 });
  }
}
