import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listRisks, createRisk } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const risks = await listRisks(tenant.context);
    return NextResponse.json({ risks });
  } catch (err) {
    console.error('[GET /api/morgan/risks]', err);
    return NextResponse.json({ error: 'Failed to fetch risks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const risk = await createRisk(body, tenant.context);
    return NextResponse.json({ risk }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/risks]', err);
    return NextResponse.json({ error: 'Failed to create risk' }, { status: 500 });
  }
}
