import { NextResponse } from 'next/server';
import { listTimeReports, createTimeReport } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }
    const entries = await listTimeReports(tenant.context);
    return NextResponse.json({ entries });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load time reports.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }
    const entry = await createTimeReport(body ?? {}, tenant.context);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create time report.' }, { status: 500 });
  }
}
