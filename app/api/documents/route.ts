import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * List Documents API
 * GET /api/documents
 */
export async function GET(request: Request) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');

    const supabase = await createClient();
    let dbQuery = supabase
      .from('documents')
      .select('*, projects_master(project_name)')
      .order('created_at', { ascending: false });

    if (category) dbQuery = dbQuery.eq('category', category);
    if (projectId) dbQuery = dbQuery.eq('project_id', projectId);

    const { data, error } = await dbQuery;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error('DOCUMENTS_LIST_FAILURE', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
