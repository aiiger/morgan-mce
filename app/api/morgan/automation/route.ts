import { NextResponse } from 'next/server';
import { getAutomationDashboardDataForTenant } from '@/lib/morgan/automation-dashboard';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const data = await getAutomationDashboardDataForTenant(tenant.context);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load automation dashboard.' }, { status: 500 });
  }
}
