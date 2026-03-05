import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listTimesheets, createTimesheet } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const timesheets = await listTimesheets(tenant.context);
    return NextResponse.json({ timesheets });
  } catch (err) {
    console.error('[GET /api/morgan/timesheets]', err);
    return NextResponse.json({ error: 'Failed to fetch timesheets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const timesheet = await createTimesheet(body, tenant.context);
    return NextResponse.json({ timesheet }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/timesheets]', err);
    return NextResponse.json({ error: 'Failed to create timesheet' }, { status: 500 });
  }
}
