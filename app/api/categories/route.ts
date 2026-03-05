import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

const TABLE = 'todo_categories';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*, todo_task_categories(task_id)')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute task_count from junction rows
  const categories = (data ?? []).map((cat) => ({
    ...cat,
    task_count: (cat.todo_task_categories as { task_id: string }[] | null)?.length ?? 0,
    todo_task_categories: undefined,
  }));

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    userId: string;
    name: string;
    color?: string;
  };

  if (!body.userId || !body.name) {
    return NextResponse.json({ error: 'userId and name required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: body.userId, name: body.name, color: body.color ?? 'var(--brand-accent)' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data }, { status: 201 });
}
