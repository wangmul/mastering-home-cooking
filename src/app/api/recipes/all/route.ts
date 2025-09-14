import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createSupabaseServerClient('service');
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ recipes });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch recipes' }, { status: 500 });
  }
}
