import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Fabric } from '@/types/database';

export async function getActiveFabrics(): Promise<Fabric[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('fabrics')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching active fabrics:', error.message);
      return [];
    }

    return (data || []) as Fabric[];
  } catch (err) {
    console.warn('Exception in getActiveFabrics:', err);
    return [];
  }
}

export async function getAllFabrics(): Promise<Fabric[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('fabrics')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all fabrics:', error.message);
      return [];
    }

    return (data || []) as Fabric[];
  } catch (err) {
    console.warn('Exception in getAllFabrics:', err);
    return [];
  }
}
