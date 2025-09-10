import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createSupabaseServerClient('service');

  // Check user is real
  const { data: userRes, error: userError } = await createSupabaseServerClient('anon').auth.getUser(token);
  if (userError || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = userRes.user;

  const body = await req.json();
  const { title, created_at } = body as { title?: string; created_at?: string };

  if (!title && !created_at) {
    return NextResponse.json({ error: 'Missing fields to update' }, { status: 400 });
  }

  const fieldsToUpdate: { title?: string; created_at?: string } = {};
  if (title) fieldsToUpdate.title = title;
  if (created_at) fieldsToUpdate.created_at = created_at;

  const { data, error } = await supabase
    .from('recipes')
    .update(fieldsToUpdate)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, recipe: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const anon = createSupabaseServerClient('anon');
  const { data } = await anon.auth.getUser(token);
  const user = data.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServerClient('service');
  const { error } = await supabase.from('recipes').delete().eq('id', params.id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

