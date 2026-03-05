import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listPortfolios, createPortfolio } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const portfolios = await listPortfolios(tenant.context);
    return NextResponse.json({ portfolios });
  } catch (err) {
    console.error('[GET /api/morgan/portfolios]', err);
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const portfolio = await createPortfolio(body, tenant.context);
    return NextResponse.json({ portfolio }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/portfolios]', err);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}
