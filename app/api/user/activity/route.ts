import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const filter = searchParams.get('filter') ?? 'all'; // all | logins | changes | security
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient();

  let query = supabase
    .from('todo_activity_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter !== 'all') {
    const filterMap: Record<string, string[]> = {
      logins: ['login'],
      changes: ['task_created', 'task_updated', 'task_deleted', 'category_created'],
      security: ['password_changed', 'security_update'],
    };
    const types = filterMap[filter];
    if (types) query = query.in('action_type', types);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activity: data, total: count });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    userId: string;
    action_type: string;
    description?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.userId || !body.action_type) {
    return NextResponse.json({ error: 'userId and action_type required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('todo_activity_logs')
    .insert({
      user_id: body.userId,
      action_type: body.action_type,
      description: body.description,
      ip_address: body.ip_address,
      user_agent: body.user_agent,
      metadata: body.metadata,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data }, { status: 201 });
}
