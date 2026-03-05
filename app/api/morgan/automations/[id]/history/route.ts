import { NextResponse } from 'next/server';
import { listAutomationExecutionHistory } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const history = await listAutomationExecutionHistory(id, tenant.context);
    return NextResponse.json({ history });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load automation history.' }, { status: 500 });
  }
}
