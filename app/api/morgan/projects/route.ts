import { NextResponse } from 'next/server';
import { createProject, getProjectById, listProjects } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { normalizeProjectStatus } from '@/utils/workflow';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const projects = await listProjects(tenant.context);
    return NextResponse.json(projects);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load Morgan projects.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    body.status = body?.status ? normalizeProjectStatus(body.status) : 'Draft';
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const idempotencyKey = request.headers.get('x-idempotency-key')?.trim();
    if (idempotencyKey && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('morgan_projects')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .eq('user_id', tenant.context.userId)
        .eq('workspace_id', tenant.context.workspaceId)
        .maybeSingle<{ id: string }>();

      if (data?.id) {
        const existing = await getProjectById(data.id, tenant.context);
        if (existing) return NextResponse.json(existing, { status: 200 });
      }
    }

    if (idempotencyKey) body.idempotencyKey = idempotencyKey;

    const created = await createProject(body ?? {}, tenant.context);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create Morgan project.' }, { status: 500 });
  }
}
