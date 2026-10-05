import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Enquiry } from '@/types/database';

export async function createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at' | 'status'> & { status?: string }) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('enquiries')
      .insert([
        {
          ...enquiry,
          status: enquiry.status || 'new',
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Error creating enquiry:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit enquiry';
    console.warn('Exception in createEnquiry:', err);
    return { success: false, error: message };
  }
}

export async function getEnquiries(): Promise<Enquiry[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching enquiries:', error.message);
      return [];
    }

    return (data || []) as Enquiry[];
  } catch (err) {
    console.warn('Exception in getEnquiries:', err);
    return [];
  }
}
