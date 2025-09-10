import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient(role: 'anon' | 'service' = 'anon') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing SUPABASE_URL');

  const key =
    role === 'service'
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) throw new Error('Missing Supabase key for role ' + role);

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function createSupabaseServerClientForToken(token: string) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase envs');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } as any },
  } as any);
}
