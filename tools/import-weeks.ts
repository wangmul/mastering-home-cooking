import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

type Row = {
  week: number; stage: string; dish: string; skill: string; difficulty: number; time: string; color?: string;
};

function parseCSV(csv: string): Row[] {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  const idx = (name: string) => headers.findIndex(h => h.trim() === name);
  const weekI = idx('주차');
  const stageI = idx('단계');
  const dishI = idx('요리명');
  const skillI = idx('주요 기술');
  const diffI = idx('난이도');
  const timeI = idx('예상시간');
  if ([weekI, stageI, dishI, skillI, diffI, timeI].some(i => i < 0)) {
    throw new Error('CSV headers must include: 주차, 단계, 요리명, 주요 기술, 난이도, 예상시간');
  }
  return lines.filter(Boolean).map(line => {
    const cols = line.split(',');
    return {
      week: Number(cols[weekI]),
      stage: cols[stageI],
      dish: cols[dishI],
      skill: cols[skillI],
      difficulty: Number(cols[diffI]),
      time: cols[timeI],
    } as Row;
  });
}

async function main() {
  // Load local env for CLI usage
  try {
    const p = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(p)) {
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
        // Always override with .env.local values for deterministic CLI runs
        process.env[key] = val;
      }
    }
  } catch {}
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const csvPath = path.join(process.cwd(), 'myTestPage', '52주_요리_학습_플랜.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csv);

  for (const r of rows) {
    const { error } = await supabase.from('weeks').upsert({
      week: r.week,
      stage: r.stage,
      dish: r.dish,
      skill: r.skill,
      difficulty: r.difficulty,
      time: r.time,
      color: r.color || '#3498db',
    }, { onConflict: 'week' });
    if (error) throw error;
  }
  // Ensure we have 52 rows
  const { count, error: cntErr } = await supabase.from('weeks').select('*', { count: 'exact', head: true });
  if (cntErr) throw cntErr;
  console.log('Imported weeks count:', count);
}

main().catch((e) => { console.error(e); process.exit(1); });
