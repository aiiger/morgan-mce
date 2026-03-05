import { NextRequest, NextResponse } from 'next/server';
import { listProposals, createProposal } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const proposals = await listProposals(tenant.context);
    return NextResponse.json(proposals);
  } catch (err) {
    console.error('[GET /api/morgan/proposals]', err);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const proposal = await createProposal(body, tenant.context);
    return NextResponse.json(proposal, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/proposals]', err);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
