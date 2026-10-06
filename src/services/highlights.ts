import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { Highlight } from '@/types/database';

export async function getActiveHighlights(): Promise<Highlight[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching active highlights:', error.message);
      return [];
    }

    return (data || []) as Highlight[];
  } catch (err) {
    console.warn('Exception in getActiveHighlights:', err);
    return [];
  }
}

export async function getAllHighlights(): Promise<Highlight[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all highlights:', error.message);
      return [];
    }

    return (data || []) as Highlight[];
  } catch (err) {
    console.warn('Exception in getAllHighlights:', err);
    return [];
  }
}
