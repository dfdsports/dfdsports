import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface Order {
  id: string;
  name: string;
  phone: string;
  product_name: string;
  category: string | null;
  quantity: string;
  shipping_address: string;
  status: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function createOrder(
  order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status' | 'notes'>
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .insert([{ ...order, status: 'new' }])
      .select()
      .single();

    if (error) {
      console.warn('Error creating order:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    console.warn('Exception in createOrder:', err);
    return { success: false, error: message };
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders:', error.message);
      return [];
    }
    return (data || []) as Order[];
  } catch (err) {
    console.warn('Exception in getOrders:', err);
    return [];
  }
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order';
    return { success: false, error: message };
  }
}

export async function deleteOrder(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete order';
    return { success: false, error: message };
  }
}
