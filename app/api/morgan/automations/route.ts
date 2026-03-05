import { NextResponse } from 'next/server';
import { createAutomationWithLifecycle } from '@/lib/morgan/lifecycle';
import { listAutomations } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const automations = await listAutomations(tenant.context);
    return NextResponse.json(automations);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load automations.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const lifecycle = await createAutomationWithLifecycle(body ?? {}, tenant.context);
    return NextResponse.json(lifecycle, { status: lifecycle.ok ? 201 : 400 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create automation rule.' }, { status: 500 });
  }
}
