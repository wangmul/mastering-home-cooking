import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createSupabaseServerClient('anon');
  const { data, error } = await supabase
    .from('weeks')
    .select('week, stage, dish, skill, difficulty, time, color')
    .order('week');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weeks: data });
}

