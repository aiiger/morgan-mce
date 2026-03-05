import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listMilestones, createMilestone } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const milestones = await listMilestones(tenant.context);
    return NextResponse.json({ milestones });
  } catch (err) {
    console.error('[GET /api/morgan/milestones]', err);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const milestone = await createMilestone(body, tenant.context);
    return NextResponse.json({ milestone }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/milestones]', err);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
