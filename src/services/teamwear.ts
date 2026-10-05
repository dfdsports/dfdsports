import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Teamwear } from '@/types/database';

export async function getActiveTeamwear(): Promise<Teamwear[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('teamwear')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching active teamwear:', error.message);
      return [];
    }

    return (data || []) as Teamwear[];
  } catch (err) {
    console.warn('Exception in getActiveTeamwear:', err);
    return [];
  }
}

export async function getAllTeamwear(): Promise<Teamwear[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('teamwear')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all teamwear:', error.message);
      return [];
    }

    return (data || []) as Teamwear[];
  } catch (err) {
    console.warn('Exception in getAllTeamwear:', err);
    return [];
  }
}

export async function getTeamwearBySlug(slug: string): Promise<Teamwear | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('teamwear')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn(`Error fetching teamwear by slug ${slug}:`, error.message);
      return null;
    }

    return data as Teamwear | null;
  } catch (err) {
    console.warn(`Exception in getTeamwearBySlug for ${slug}:`, err);
    return null;
  }
}
