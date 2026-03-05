import { NextResponse } from 'next/server';
import { deleteTenderDocumentLink } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const deleted = await deleteTenderDocumentLink(id, tenant.context);
    if (!deleted) return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete tender document link.' }, { status: 500 });
  }
}
