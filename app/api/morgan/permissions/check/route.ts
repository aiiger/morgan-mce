import { NextResponse } from 'next/server';
import { permissionCheckState } from '@/lib/morgan/lifecycle';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function POST(request: Request) {
  const tenant = await resolveMorganTenantContext(request);
  if (!tenant.ok) {
    return NextResponse.json({ error: tenant.error }, { status: tenant.status });
  }

  const result = permissionCheckState();

  return NextResponse.json(
    {
      authorized: result.authorized,
      state: result.state,
      workspaceId: tenant.context.workspaceId,
      userId: tenant.context.userId
    },
    { status: result.authorized ? 200 : 403 }
  );
}
