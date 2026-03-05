import { NextResponse } from 'next/server';
import { getSettings, upsertSettings } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const settings = await getSettings(tenant.context);
    return NextResponse.json(settings ?? {});
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load settings.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const updated = await upsertSettings(body ?? {}, tenant.context);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save settings.' }, { status: 500 });
  }
}
