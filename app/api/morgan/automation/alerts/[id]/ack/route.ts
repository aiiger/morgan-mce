import { NextResponse } from 'next/server';
import { acknowledgeAutomationAlertForTenant } from '@/lib/morgan/automation-dashboard';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const result = await acknowledgeAutomationAlertForTenant(id, tenant.context.userId, tenant.context);
    if (!result) return NextResponse.json({ error: 'Alert not found.' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to acknowledge alert.' }, { status: 500 });
  }
}
