import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

const TABLE = 'todo_categories';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json() as { userId?: string; name?: string; color?: string };
  const { userId, ...updates } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createClient();

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

  return NextResponse.json({ category: data });
}

export async function DELETE(
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

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
