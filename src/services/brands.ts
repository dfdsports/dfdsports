import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { Brand } from '@/types/database';

export async function getActiveBrands(): Promise<Brand[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching active brands:', error.message);
      return [];
    }

    return (data || []) as Brand[];
  } catch (err) {
    console.warn('Exception in getActiveBrands:', err);
    return [];
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all brands:', error.message);
      return [];
    }

    return (data || []) as Brand[];
  } catch (err) {
    console.warn('Exception in getAllBrands:', err);
    return [];
  }
}
