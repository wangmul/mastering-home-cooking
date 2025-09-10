import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getPlanWeek } from '@/lib/plan';

// This test suite interacts with the live database.
// It requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be in the environment.

describe('Database Integration Tests', () => {
  const supabase = createSupabaseServerClient('service');
  const testRecipeTitle = `[TEST] My Test Recipe ${Date.now()}`;
  let testRecipeId: string | null = null;
  const currentWeek = getPlanWeek();
  // A dummy user ID for testing. In a real scenario, you would use a test user.
  const testUserId = '00000000-0000-0000-0000-000000000000';

  it('should insert a new recipe', async () => {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: testUserId,
        week: currentWeek,
        title: testRecipeTitle,
        notes: 'This is a test recipe.',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe(testRecipeTitle);
    testRecipeId = data.id;
  });

  it('should select the new recipe', async () => {
    // Ensure the previous test ran and set the ID
    expect(testRecipeId).not.toBeNull();

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', testRecipeId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe(testRecipeTitle);
  });

  it('should delete the new recipe', async () => {
    expect(testRecipeId).not.toBeNull();

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', testRecipeId);

    expect(error).toBeNull();
  });

  it('should confirm the recipe is deleted', async () => {
    expect(testRecipeId).not.toBeNull();

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', testRecipeId);

    // There should be no error, and the data should be an empty array
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data).toHaveLength(0);
  });
});
