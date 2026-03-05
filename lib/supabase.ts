import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __ENV?: {
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    };
  }
}

// ── Retry helper — exponential back-off for transient Supabase errors ──
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300; // 300 → 600 → 1200

export async function withRetry<T>(
  fn: () => Promise<{ data: T | null; error: { message: string; code?: string } | null }>,
  label = 'supabase',
): Promise<{ data: T | null; error: { message: string; code?: string } | null }> {
  let lastResult: { data: T | null; error: { message: string; code?: string } | null } | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    lastResult = await fn();
    if (!lastResult.error) return lastResult;
    // Retry only on transient / network errors, not on user errors (4xx)
    const code = lastResult.error.code ?? '';
    const msg = lastResult.error.message ?? '';
    const transient = /timeout|ECONNRESET|ECONNREFUSED|fetch failed|network|socket|503|502|429/i.test(msg + code);
    if (!transient) return lastResult; // deterministic error — don't retry
    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
    console.warn(`[${label}] transient error (attempt ${attempt + 1}/${MAX_RETRIES}): ${msg}. Retrying in ${delay}ms…`);
    await new Promise(r => setTimeout(r, delay));
  }
  return lastResult!;
}

// ── Health check — lightweight ping for connection validation ──
export async function checkSupabaseHealth(client: SupabaseClient | null): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  if (!client) return { ok: false, latencyMs: -1, error: 'Client is null (missing env vars)' };
  const start = Date.now();
  try {
    // Use a fast, low-cost RPC or a simple table count
    const { error } = await client.from('morgan_projects').select('id', { count: 'exact', head: true });
    const latencyMs = Date.now() - start;
    if (error) return { ok: false, latencyMs, error: error.message };
    return { ok: true, latencyMs };
  } catch (e: unknown) {
    return { ok: false, latencyMs: Date.now() - start, error: e instanceof Error ? e.message : String(e) };
  }
}

// ── Browser client (anon key, RLS-scoped) ──────────────────────────────
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export function hasSupabaseEnv() {
  const env =
    typeof window !== 'undefined' && window.__ENV
      ? window.__ENV
      : {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        };

  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const env =
      typeof window !== 'undefined' && window.__ENV
        ? window.__ENV
        : {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        };

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables. Please check your environment.');
    }

    supabaseInstance = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
        global: {
          headers: { 'x-app-name': 'mce-command-center' },
        },
      }
    );
  }
  return supabaseInstance;
}

// For legacy code support during migration, but we should eventually use the getter
export const supabase = getSupabaseClient();

// ── Server admin client (service role, bypasses RLS) ───────────────────
export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: { 'x-app-name': 'mce-command-center-admin' },
        },
      });
    }
  }
  return supabaseAdminInstance;
}

export const supabaseAdmin = getSupabaseAdmin();

