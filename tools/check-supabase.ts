import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvLocal() {
  try {
    const p = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(p)) return;
    const text = fs.readFileSync(p, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Always override with .env.local for deterministic checks
      process.env[key] = val;
    }
  } catch {}
}

async function main() {
  loadEnvLocal();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const result: any = {
    env: {
      hasUrl: !!url,
      hasAnonKey: !!anon,
      hasServiceRoleKey: !!service,
    },
    keys: {
      anonRole: undefined as undefined | string,
      serviceRole: undefined as undefined | string,
    },
    anon: { ok: false },
    service: { ok: false },
  };

  if (!url || !anon) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  try {
    const client = createClient(url!, anon!, { auth: { persistSession: false } });
    try {
      const payload = JSON.parse(Buffer.from(anon!.split('.')[1], 'base64url').toString());
      result.keys.anonRole = payload.role;
    } catch {}
    const { error } = await client.from('weeks').select('*', { head: true, count: 'exact' });
    if (error) throw error;
    result.anon.ok = true;
  } catch (e: any) {
    result.anon.error = e?.message || String(e);
  }

  if (service) {
    try {
      const svc = createClient(url!, service!, { auth: { persistSession: false } });
      try {
        const payload = JSON.parse(Buffer.from(service!.split('.')[1], 'base64url').toString());
        result.keys.serviceRole = payload.role;
      } catch {}
      const { error } = await svc.from('weeks').select('*', { head: true, count: 'exact' });
      if (error) throw error;
      result.service.ok = true;
    } catch (e: any) {
      result.service.error = e?.message || String(e);
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
