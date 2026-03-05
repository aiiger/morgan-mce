import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * List Resource Allocations API
 * GET /api/resources/allocations
 */
export async function GET() {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('resource_allocations')
      .select(`
        *,
        team_members (name),
        projects_master (project_name)
      `)
      .eq('status', 'Active')
      .order('start_date');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error('ALLOCATIONS_LIST_FAILURE', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }
}
