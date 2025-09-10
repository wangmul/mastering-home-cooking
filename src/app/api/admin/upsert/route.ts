import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    // Verify bearer token and allowed email
    const auth = req.headers.get('authorization') || '';
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const anon = createSupabaseServerClient('anon');
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const email = userData.user.email.toLowerCase();
    const allowed = (process.env.ALLOWED_ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!allowed.includes(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, body: content } = body as { title?: string; slug?: string; body?: string };
    if (!title || !slug) {
      return NextResponse.json({ error: 'Missing title or slug' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('pages')
      .upsert({ title, slug, body: content ?? '' }, { onConflict: 'slug' })
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, page: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
