import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

const TABLE = 'todo_tasks';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient();

  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const archived = searchParams.get('archived'); // 'true' | 'false' | null
  const deleted = searchParams.get('deleted');   // 'true' | 'false' | null

  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Default: exclude deleted + archived unless explicitly requested
  if (deleted === 'true') {
    query = query.not('deleted_at', 'is', null);
  } else if (archived === 'true') {
    query = query.not('archived_at', 'is', null).is('deleted_at', null);
  } else {
    // Normal active tasks
    query = query.is('deleted_at', null).is('archived_at', null);
  }

  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    userId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    category_ids?: string[];
  };

  if (!body.userId || !body.title) {
    return NextResponse.json({ error: 'userId and title required' }, { status: 400 });
  }

  const supabase = createClient();

  const { category_ids, userId, ...taskFields } = body;

  const { data: task, error } = await supabase
    .from(TABLE)
    .insert({ ...taskFields, user_id: userId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach categories if provided
  if (category_ids && category_ids.length > 0) {
    const links = category_ids.map((cid) => ({ task_id: task.id, category_id: cid }));
    await supabase.from('todo_task_categories').insert(links);
  }

  // Log activity
  await supabase.from('todo_activity_logs').insert({
    user_id: userId,
    action_type: 'task_created',
    description: `Created task: ${task.title}`,
    metadata: { task_id: task.id },
  });

  return NextResponse.json({ task }, { status: 201 });
}
