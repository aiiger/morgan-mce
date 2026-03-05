import { NextResponse } from 'next/server';
import { createWorkflowWithLifecycle } from '@/lib/morgan/lifecycle';
import { listWorkflows } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const workflows = await listWorkflows(tenant.context);
    return NextResponse.json(workflows);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load workflows.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const lifecycle = await createWorkflowWithLifecycle(body ?? {}, tenant.context);
    return NextResponse.json(lifecycle, { status: lifecycle.ok ? 201 : 400 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create workflow.' }, { status: 500 });
  }
}
