import { createClient } from '@supabase/supabase-js';

/**
 * A plain (cookie-free) Supabase client for public read-only queries.
 * Use this in server-side data fetching functions that don't need auth
 * (e.g. fetching hero slides, categories, products for the public site).
 * Unlike createServerSupabaseClient, this does NOT call cookies() so it
 * works safely during ISR / static generation without triggering
 * DYNAMIC_SERVER_USAGE errors.
 */
export const createPublicSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createClient(url, anonKey);
};
