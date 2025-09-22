import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServerClientForToken } from '@/lib/supabase-server';
import { getPlanWeek } from '@/lib/plan';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ recipes: [] });
  const anon = createSupabaseServerClient('anon');
  const { data } = await anon.auth.getUser(token);
  const user = data.user;
  if (!user) return NextResponse.json({ recipes: [] });
  const week = getPlanWeek();
  const { data: recipes, error } = await anon.from('recipes').select('*').eq('user_id', user.id).eq('week', week).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recipes });
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const anon = createSupabaseServerClient('anon');
  const { data } = await anon.auth.getUser(token);
  const user = data.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, notes, photo_url, week: w, rating, created_at } = body as { title?: string; notes?: string; photo_url?: string; week?: number; rating?: string, created_at?: string };
  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  const week = w ?? getPlanWeek();

  const supabase = createSupabaseServerClient('service');
  const recipeData: any = { user_id: user.id, week, title, notes: notes || null, photo_url: photo_url ?? null, rating: rating || null };
  if (created_at) {
    recipeData.created_at = created_at;
  }
  const { error } = await supabase.from('recipes').insert(recipeData);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

