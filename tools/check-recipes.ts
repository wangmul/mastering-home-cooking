import { createSupabaseServerClient } from '@/lib/supabase-server';
import dotenv from 'dotenv';

async function checkRecipes() {
  // Load .env.local
  dotenv.config({ path: '.env.local' });

  console.log('Connecting to Supabase to check recipes...');
  const supabase = createSupabaseServerClient('service');

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No recipes found in the database.');
    return;
  }

  console.log('Found recipes in the database:');
  console.table(data);
}

checkRecipes().catch(console.error);
