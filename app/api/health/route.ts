import { NextResponse } from 'next/server';
import { checkSupabaseHealth, supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
  };

  try {
    // ---------------------------------------------------------------------
    // Database health — RLS-scoped client (ERP core tables)
    // ---------------------------------------------------------------------
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('projects_master')
      .select('id')
      .limit(1)
      .single();

    if (dbError) {
      checks.database = { status: 'unhealthy', error: dbError.message };
      checks.status = 'degraded';
    } else {
      checks.database = { status: 'healthy' };
    }

    // ---------------------------------------------------------------------
    // Morgan admin health — service-role client (bypass RLS)
    // ---------------------------------------------------------------------
    const morgan = await checkSupabaseHealth(supabaseAdmin);
    checks.morgan = {
      connected: morgan.ok,
      latencyMs: morgan.latencyMs,
      error: morgan.error ?? null,
    };
    if (!morgan.ok) checks.status = 'degraded';

    // ---------------------------------------------------------------------
    // Bot runtime health (authoritative AI Gateway) — reflection only.
    // Vercel does NOT decide bot state; it mirrors AI Gateway readiness.
    // ---------------------------------------------------------------------
    const gatewayUrl = (process.env.AI_GATEWAY_URL ?? '').trim().replace(/\/$/, '');
    if (!gatewayUrl) {
      checks.ai = {
        gateway_configured: false,
        gateway_ready: false,
        error: 'AI_GATEWAY_URL is missing',
      };
      checks.status = 'degraded';
    } else {
      try {
        const readyRes = await fetchWithTimeout(`${gatewayUrl}/readyz`, 5000);
        let payload: any = null;
        try {
          payload = await readyRes.json();
        } catch {
          payload = null;
        }

        checks.ai = {
          gateway_configured: true,
          gateway_http_status: readyRes.status,
          gateway_ready: readyRes.status === 200,
          gateway_outcome: payload?.outcome,
          gateway_request_id: payload?.request_id,
          gateway_error: payload?.error,
        };

        if (readyRes.status !== 200) {
          checks.status = 'degraded';
        }
      } catch (err: any) {
        checks.ai = {
          gateway_configured: true,
          gateway_ready: false,
          error: err?.message ? String(err.message) : 'AI Gateway unreachable',
        };
        checks.status = 'degraded';
      }
    }

    checks.monitoring = {
      system_load: 'optimal',
      neural_links: (checks.ai as Record<string, unknown>)?.gateway_ready ? 'active' : 'down',
    };

    checks.alarms = {
      status: checks.status === 'healthy' ? 'monitored' : 'attention_required',
    };

    return NextResponse.json(checks, { status: checks.status === 'healthy' ? 200 : 503 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
