import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

const TABLE = 'todo_tasks';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*, todo_task_categories(category_id)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ task: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json() as Record<string, unknown> & { userId?: string };
  const { userId, ...updates } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createClient();

  // Handle status transitions
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  } else if (updates.status && updates.status !== 'completed') {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const permanent = searchParams.get('permanent') === 'true';

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createClient();

  if (permanent) {
    // Hard delete
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Soft delete → move to trash
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
