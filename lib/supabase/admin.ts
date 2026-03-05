import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service-role admin client that bypasses RLS.
// Use ONLY in server-side code (API routes, server components, scripts).
// Never expose the service role key to the browser.

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
