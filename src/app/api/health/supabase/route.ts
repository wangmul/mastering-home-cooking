import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const result: any = {
    env: {
      hasUrl: !!url,
      hasAnonKey: !!anon,
      hasServiceRoleKey: !!service,
    },
    anon: { ok: false },
    service: { ok: false },
  };

  if (!url || !anon) {
    return NextResponse.json(result, { status: 200 });
  }

  try {
    const client = createClient(url, anon, { auth: { persistSession: false } });
    const { error } = await client.from('weeks').select('*', { head: true, count: 'exact' });
    if (error) throw error;
    result.anon.ok = true;
  } catch (e: any) {
    result.anon.error = e?.message || String(e);
  }

  if (service) {
    try {
      const svc = createClient(url, service, { auth: { persistSession: false } });
      const { error } = await svc.from('weeks').select('*', { head: true, count: 'exact' });
      if (error) throw error;
      result.service.ok = true;
    } catch (e: any) {
      result.service.error = e?.message || String(e);
    }
  }

  return NextResponse.json(result);
}

