import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('todo_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Auto-create a minimal profile row if user doesn't exist yet
    if (error.code === 'PGRST116') {
      return NextResponse.json({ profile: null });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const body = await request.json() as {
    userId: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    about?: string;
    location?: string;
    timezone?: string;
    profile_picture_url?: string;
  };

  const { userId, ...updates } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('todo_users')
    .upsert({ id: userId, ...updates })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
