import { NextRequest, NextResponse } from 'next/server';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });

    const { data, error } = await supabaseAdmin
      .from('morgan_resources')
      .select('*')
      .eq('user_id', tenant.context.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ resources: data ?? [] });
  } catch (err: any) {
    console.error('[GET /api/morgan/resources]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });

    const id = `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const row = {
      id,
      user_id: tenant.context.userId,
      workspace_id: tenant.context.workspaceId || 'default',
      name: body.name || body.full_name || '',
      role: body.role || '',
      department: body.department || 'Projects',
      hourly_rate: body.hourly_rate || 0,
      status: body.status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('morgan_resources')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ resource: data }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/morgan/resources]', err);
    return NextResponse.json({ error: err.message || 'Failed to create resource' }, { status: 500 });
  }
}
