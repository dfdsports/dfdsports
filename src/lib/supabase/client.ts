import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './config';

let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  client = createBrowserClient(url, anonKey);
  return client;
};
