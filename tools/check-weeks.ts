import { createSupabaseServerClient } from '@/lib/supabase-server';
import dotenv from 'dotenv';

async function checkWeeks() {
  // Load .env.local
  dotenv.config({ path: '.env.local' });

  console.log('Connecting to Supabase to check weeks table...');
  const supabase = createSupabaseServerClient('service');

  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .order('week', { ascending: true });

  if (error) {
    console.error('Error fetching weeks:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No data found in the weeks table.');
    return;
  }

  console.log('Found data in the weeks table:');
  console.table(data);
}

checkWeeks().catch(console.error);
