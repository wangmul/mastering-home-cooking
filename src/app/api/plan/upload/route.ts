import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const anon = createSupabaseServerClient('anon');
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user?.id) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = userData.user.id;
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    const prefix = `recipes/${userId}`;
    const supabase = createSupabaseServerClient('service');
    const arrayBuffer = await (file as File).arrayBuffer();
    const path = `${prefix}/${Date.now()}-${(file as File).name}`;
    const { data, error } = await supabase.storage.from('images').upload(path, arrayBuffer, {
      contentType: (file as File).type || 'application/octet-stream',
      upsert: false,
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from('images').getPublicUrl(data.path);
    return NextResponse.json({ ok: true, path: data.path, url: pub.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}

