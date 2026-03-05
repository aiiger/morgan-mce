import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listAllAutomationExecutionHistory } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const history = await listAllAutomationExecutionHistory(tenant.context);
    return NextResponse.json({ history });
  } catch (err) {
    console.error('[GET /api/morgan/automation/history]', err);
    return NextResponse.json({ error: 'Failed to fetch automation history' }, { status: 500 });
  }
}
