import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { CompanySettings } from '@/types/database';

export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching company settings:', error.message);
      return null;
    }

    return data as CompanySettings | null;
  } catch (err) {
    console.warn('Exception in getCompanySettings:', err);
    return null;
  }
}
