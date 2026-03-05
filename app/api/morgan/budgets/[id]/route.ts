import { NextResponse } from 'next/server';
import { getBudgetById, updateBudget, deleteBudget } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const item = await getBudgetById(id, tenant.context);
    if (!item) return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load budget.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const body = await request.json();
    const updated = await updateBudget(id, body, tenant.context);
    if (!updated) return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update budget.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const { id } = await params;
    const deleted = await deleteBudget(id, tenant.context);
    if (!deleted) return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete budget.' }, { status: 500 });
  }
}
