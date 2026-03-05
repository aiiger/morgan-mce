import { NextResponse } from 'next/server';
import { listLessonsLearned, createLessonLearned } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const items = await listLessonsLearned(tenant.context);
    return NextResponse.json(items);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load lessons learned.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const created = await createLessonLearned(body ?? {}, tenant.context);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create lesson learned.' }, { status: 500 });
  }
}
