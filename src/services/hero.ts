import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { HeroSlide } from '@/types/database';

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching hero slides:', error.message);
      return [];
    }

    return (data || []) as HeroSlide[];
  } catch (err) {
    console.warn('Exception in getActiveHeroSlides:', err);
    return [];
  }
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all hero slides:', error.message);
      return [];
    }

    return (data || []) as HeroSlide[];
  } catch (err) {
    console.warn('Exception in getAllHeroSlides:', err);
    return [];
  }
}
