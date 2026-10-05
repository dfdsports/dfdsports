import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getAdminUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    console.warn('Auth check error:', err);
    return null;
  }
}

export async function requireAdminAuth() {
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/login');
  }
  return user;
}
