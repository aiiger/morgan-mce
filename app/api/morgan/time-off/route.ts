import { NextRequest, NextResponse } from 'next/server';
import { listTimeOff, createTimeOff } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const records = await listTimeOff(tenant.context);
    return NextResponse.json(records);
  } catch (err) {
    console.error('[GET /api/morgan/time-off]', err);
    return NextResponse.json({ error: 'Failed to fetch time-off records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const record = await createTimeOff(body, tenant.context);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/time-off]', err);
    return NextResponse.json({ error: 'Failed to create time-off record' }, { status: 500 });
  }
}
