import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { Product } from '@/types/database';

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug), brand:brands(id, name, slug, logo_url)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(limit);

    if (error) {
      console.warn('Error fetching featured products:', error.message);
      return [];
    }

    return (data || []) as Product[];
  } catch (err) {
    console.warn('Exception in getFeaturedProducts:', err);
    return [];
  }
}

export async function getActiveProducts(params?: {
  categoryId?: string;
  categorySlug?: string;
  categorySlugs?: string[];
  brandId?: string;
  brandSlug?: string;
  brandSlugs?: string[];
  limit?: number;
}): Promise<Product[]> {
  try {
    const supabase = createPublicSupabaseClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(id, name, slug), brand:brands(id, name, slug, logo_url)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (params?.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    if (params?.brandId) {
      query = query.eq('brand_id', params.brandId);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching active products:', error.message);
      return [];
    }

    let products = (data || []) as Product[];

    if (params?.categorySlug) {
      products = products.filter((p) => p.category?.slug === params.categorySlug);
    }

    if (params?.categorySlugs && params.categorySlugs.length > 0) {
      products = products.filter((p) => p.category?.slug && params.categorySlugs?.includes(p.category.slug));
    }

    if (params?.brandSlug) {
      products = products.filter((p) => p.brand?.slug === params.brandSlug);
    }

    if (params?.brandSlugs && params.brandSlugs.length > 0) {
      products = products.filter((p) => p.brand?.slug && params.brandSlugs?.includes(p.brand.slug));
    }

    return products;
  } catch (err) {
    console.warn('Exception in getActiveProducts:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug), brand:brands(id, name, slug, logo_url)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn(`Error fetching product by slug ${slug}:`, error.message);
      return null;
    }

    return data as Product | null;
  } catch (err) {
    console.warn(`Exception in getProductBySlug for ${slug}:`, err);
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug), brand:brands(id, name, slug, logo_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching all products:', error.message);
      return [];
    }

    return (data || []) as Product[];
  } catch (err) {
    console.warn('Exception in getAllProducts:', err);
    return [];
  }
}
