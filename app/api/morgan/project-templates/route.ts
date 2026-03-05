import { NextResponse } from 'next/server';
import { templateQueryRecoverableFailure } from '@/lib/morgan/lifecycle';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  const tenant = await resolveMorganTenantContext(request);
  if (!tenant.ok) {
    return NextResponse.json({ error: tenant.error }, { status: tenant.status });
  }

  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm')?.trim() ?? '';

  if (searchTerm.length > 0 && /fail|error|trigger500/i.test(searchTerm)) {
    return NextResponse.json(
      templateQueryRecoverableFailure('Template query failed in a recoverable subsystem path.'),
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    templates: [
      { id: 'TPL-001', name: 'Standard EPC Project' },
      { id: 'TPL-002', name: 'Fast Track Design-Build' },
      { id: 'TPL-003', name: 'Infrastructure Delivery - Public Sector' }
    ]
  });
}
