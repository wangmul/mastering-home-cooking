import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServerClientForToken } from '@/lib/supabase-server';

async function getUserFromAuthHeader(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const anon = createSupabaseServerClient('anon');
  const { data } = await anon.auth.getUser(token);
  return data?.user || null;
}

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ progress: [] });
  const supabase = createSupabaseServerClientForToken((req.headers.get('authorization') || '').slice(7));
  const { data, error } = await supabase
    .from('progress')
    .select('week, completed')
    .eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ progress: data });
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { week, completed } = body as { week?: number; completed?: boolean };
  if (!week || typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const supabase = createSupabaseServerClientForToken((req.headers.get('authorization') || '').slice(7));
  const { error } = await supabase
    .from('progress')
    .upsert({ user_id: user.id, week, completed }, { onConflict: 'user_id,week' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
