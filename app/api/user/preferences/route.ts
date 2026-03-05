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
    .from('todo_user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Return defaults
    return NextResponse.json({
      preferences: {
        user_id: userId,
        theme: 'dark',
        default_view: 'dashboard',
        default_sort: 'due_date',
        tasks_per_page: 20,
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        email_notifications: true,
        daily_digest: false,
        due_date_reminders: true,
        auto_archive_completed: false,
        archive_after_days: 14,
        default_task_priority: 'medium',
        default_task_status: 'pending',
        week_starts_on: 'monday',
      },
    });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferences: data });
}

export async function PUT(request: NextRequest) {
  const body = await request.json() as Record<string, unknown> & { userId?: string };
  const { userId, ...updates } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('todo_user_preferences')
    .upsert({ user_id: userId, ...updates })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferences: data });
}
