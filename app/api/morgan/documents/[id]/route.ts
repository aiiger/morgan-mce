import { NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const item = await getDocumentById(id, tenant.context);
    if (!item) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load document.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const body = await request.json();
    const updated = await updateDocument(id, body, tenant.context);
    if (!updated) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update document.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const deleted = await deleteDocument(id, tenant.context);
    if (!deleted) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete document.' }, { status: 500 });
  }
}
