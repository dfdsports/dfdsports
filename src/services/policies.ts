import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { PolicySection, PolicyType } from '@/types/database';

/**
 * Fetch active policy sections for public storefront purely from the database.
 * No hardcoded fallback data.
 */
export async function getActivePoliciesByType(
  policyType: PolicyType
): Promise<PolicySection[]> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('policy_type', policyType)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn(`Error fetching ${policyType} policies:`, error.message);
      return [];
    }

    return (data || []) as PolicySection[];
  } catch (err) {
    console.warn(`Exception in getActivePoliciesByType for ${policyType}:`, err);
    return [];
  }
}

/**
 * Fetch all policy sections for admin management from the database.
 */
export async function getAllPoliciesAdmin(
  policyType?: PolicyType
): Promise<PolicySection[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('policies')
      .select('*')
      .order('display_order', { ascending: true });

    if (policyType) {
      query = query.eq('policy_type', policyType);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching admin policies:', error.message);
      return [];
    }

    return (data || []) as PolicySection[];
  } catch (err) {
    console.warn('Exception in getAllPoliciesAdmin:', err);
    return [];
  }
}
