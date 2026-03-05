import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listDocuments, createDocument } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const documents = await listDocuments(tenant.context);
    return NextResponse.json({ documents });
  } catch (err) {
    console.error('[GET /api/morgan/documents]', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const document = await createDocument(body, tenant.context);
    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/documents]', err);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
