import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// FORCE DYNAMIC: We do not want Next.js caching this endpoint during stress tests
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const start = Date.now();
  
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
    }

    // Simulate real app load: fire off a few concurrent queries against the database
    const [projectsRes, tendersRes, workflowsRes] = await Promise.all([
      supabaseAdmin.from('morgan_projects').select('id, name, status').limit(20),
      supabaseAdmin.from('morgan_tenders').select('id, name, status').limit(20),
      supabaseAdmin.from('morgan_workflows').select('id, name, status').limit(20)
    ]);

    const end = Date.now();

    return NextResponse.json({
      status: 'ok',
      latency_ms: end - start,
      data_points: {
        projects: projectsRes.data?.length || 0,
        tenders: tendersRes.data?.length || 0,
        workflows: workflowsRes.data?.length || 0,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
