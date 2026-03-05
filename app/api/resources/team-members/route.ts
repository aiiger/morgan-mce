import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * List Team Members API
 * GET /api/resources/team-members
 */
export async function GET() {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error('TEAM_MEMBERS_LIST_FAILURE', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
