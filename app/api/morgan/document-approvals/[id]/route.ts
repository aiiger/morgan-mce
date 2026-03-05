import { NextRequest, NextResponse } from 'next/server';
import { updateDocumentApproval, deleteDocumentApproval } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const updated = await updateDocumentApproval(id, body, tenant.context);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/morgan/document-approvals/[id]]', err);
    return NextResponse.json({ error: 'Failed to update document approval' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    await deleteDocumentApproval(id, tenant.context);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/morgan/document-approvals/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete document approval' }, { status: 500 });
  }
}
