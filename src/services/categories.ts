import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Category } from '@/types/database';

export async function getActiveCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching active categories:', error.message);
      return [];
    }

    return (data || []) as Category[];
  } catch (err) {
    console.warn('Exception in getActiveCategories:', err);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Error fetching all categories:', error.message);
      return [];
    }

    return (data || []) as Category[];
  } catch (err) {
    console.warn('Exception in getAllCategories:', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn(`Error fetching category with slug ${slug}:`, error.message);
      return null;
    }

    return data as Category | null;
  } catch (err) {
    console.warn(`Exception in getCategoryBySlug for ${slug}:`, err);
    return null;
  }
}
