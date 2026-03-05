import { NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listTenderDocumentLinks, createTenderDocumentLink } from '@/lib/morgan/persistence';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }
    const links = await listTenderDocumentLinks(tenant.context);
    return NextResponse.json({ links });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list tender document links';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }
    const body = await request.json();
    if (!body.documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }
    const link = await createTenderDocumentLink(body, tenant.context);
    if (!link) {
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }
    return NextResponse.json(link, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create tender document link';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
