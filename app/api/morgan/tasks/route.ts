import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { listTasks, createTask } from '@/lib/morgan/persistence';

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const tasks = await listTasks(tenant.context);
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('[GET /api/morgan/tasks]', err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const task = await createTask(body, tenant.context);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/morgan/tasks]', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
