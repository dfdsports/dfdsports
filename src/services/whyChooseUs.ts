import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { WhyChooseUs } from '@/types/database';

export async function getActiveWhyChooseUs(): Promise<WhyChooseUs[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('why_choose_us')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching why_choose_us:', error.message);
      return [];
    }

    return (data || []) as WhyChooseUs[];
  } catch (err) {
    console.warn('Exception in getActiveWhyChooseUs:', err);
    return [];
  }
}

export async function getAllWhyChooseUs(): Promise<WhyChooseUs[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('why_choose_us')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all why_choose_us:', error.message);
      return [];
    }

    return (data || []) as WhyChooseUs[];
  } catch (err) {
    console.warn('Exception in getAllWhyChooseUs:', err);
    return [];
  }
}
