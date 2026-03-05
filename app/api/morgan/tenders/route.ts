import { NextResponse } from 'next/server';
import { createTender, getTenderById, listTenders } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const tenders = await listTenders(tenant.context);
    return NextResponse.json(tenders);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load Morgan tenders.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) {
      return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    }

    const idempotencyKey = request.headers.get('x-idempotency-key')?.trim();
    if (idempotencyKey && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('morgan_tenders')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .eq('user_id', tenant.context.userId)
        .eq('workspace_id', tenant.context.workspaceId)
        .maybeSingle<{ id: string }>();

      if (data?.id) {
        const existing = await getTenderById(data.id, tenant.context);
        if (existing) return NextResponse.json(existing, { status: 200 });
      }
    }

    if (idempotencyKey) body.idempotencyKey = idempotencyKey;

    const created = await createTender(body ?? {}, tenant.context);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create Morgan tender.' }, { status: 500 });
  }
}
