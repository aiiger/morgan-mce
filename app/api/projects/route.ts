import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * List Projects API
 * GET /api/projects
 */
export async function GET(request: Request) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query = searchParams.get('q');

    const supabase = await createClient();
    let dbQuery = supabase.from('projects_master').select('*').order('created_at', { ascending: false });

    if (status) dbQuery = dbQuery.eq('project_status', status);
    if (query) dbQuery = dbQuery.or(`project_name.ilike.%${query}%,project_code.ilike.%${query}%`);

    const { data, error } = await dbQuery;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error('PROJECTS_LIST_FAILURE', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * Create Project API
 * POST /api/projects
 */
export async function POST(request: Request) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Verify user tier (L3+ required for creation)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('clerk_user_id', userId)
      .single();

    if (!profile || !['L3', 'L4'].includes(profile.tier || '')) {
      return NextResponse.json({ error: 'Forbidden: L3+ permission required' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('projects_master')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    logger.info('PROJECT_CREATED', { id: data.id, userId });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create project';
    logger.error('PROJECT_CREATE_FAILURE', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
