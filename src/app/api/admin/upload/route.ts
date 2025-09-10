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
    if (userErr || !userData?.user?.email) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const allowed = (process.env.ALLOWED_ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const email = userData.user.email!.toLowerCase();
    if (!allowed.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const form = await req.formData();
    const file = form.get('file');
    const prefix = (form.get('prefix') as string) || 'uploads';
    if (!file || typeof file === 'string') return NextResponse.json({ error: 'Missing file' }, { status: 400 });

    const supabase = createSupabaseServerClient('service');
    const arrayBuffer = await file.arrayBuffer();
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

