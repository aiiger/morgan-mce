import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * List Tenders API
 * GET /api/tenders
 */
export async function GET(request: Request) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error('TENDERS_LIST_FAILURE', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Failed to fetch tenders' }, { status: 500 });
  }
}

/**
 * Create Tender API
 * POST /api/tenders
 */
export async function POST(request: Request) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Verify user tier (L3+ required)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('clerk_user_id', userId)
      .single();

    if (!profile || !['L3', 'L4'].includes(profile.tier || '')) {
      return NextResponse.json({ error: 'Forbidden: L3+ permission required' }, { status: 403 });
    }

    // Assign owner
    const tenderData = { ...body, owner_user_id: userId };

    const { data, error } = await supabase
      .from('tenders')
      .insert([tenderData])
      .select()
      .single();

    if (error) throw error;

    logger.info('TENDER_CREATED', { id: data.id, userId });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create tender';
    logger.error('TENDER_CREATE_FAILURE', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
