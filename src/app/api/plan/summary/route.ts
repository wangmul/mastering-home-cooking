import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getPlanWeek, getNextPlanWeek } from '@/lib/plan';

export async function GET(req: Request) {
  const supabaseAnon = createSupabaseServerClient('anon');
  const current = getPlanWeek();
  const next = getNextPlanWeek();

  const [{ data: week }, { data: nextWeek }] = await Promise.all([
    supabaseAnon.from('weeks').select('*').eq('week', current).maybeSingle(),
    supabaseAnon.from('weeks').select('*').eq('week', next).maybeSingle(),
  ]);

  // user context (optional)
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
  let userId: string | null = null;
  if (token) {
    const { data } = await supabaseAnon.auth.getUser(token);
    userId = data.user?.id ?? null;
  }

  let recipes: any[] = [];
  let completed = false;
  if (userId) {
    // HACK: Use service role to bypass RLS for recipes temporarily
    const supabaseService = createSupabaseServerClient('service');
    const [{ data: r }, { data: p }] = await Promise.all([
      supabaseService.from('recipes').select('*').eq('user_id', userId).eq('week', current).order('created_at', { ascending: false }),
      supabaseAnon.from('progress').select('completed').eq('user_id', userId).eq('week', current).maybeSingle(),
    ]);
    recipes = r || [];
    completed = !!p?.completed;
  }

  return NextResponse.json({ currentWeek: current, week, nextWeek, recipes, completed });
}

