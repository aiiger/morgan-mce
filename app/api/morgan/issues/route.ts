import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listIssues, createIssue } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const issues = await listIssues(tenant.context);
    return NextResponse.json({ issues });
  } catch (err) {
    console.error('[GET /api/morgan/issues]', err);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const issue = await createIssue(body, tenant.context);
    return NextResponse.json({ issue }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/issues]', err);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
