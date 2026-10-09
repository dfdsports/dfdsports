import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

async function getClient() {
  const adminClient = createAdminSupabaseClient();
  if (adminClient) return adminClient;
  return await createServerSupabaseClient();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const supabase = await getClient();
    let query = supabase.from('policies').select('*').order('display_order', { ascending: true });

    if (type) {
      query = query.eq('policy_type', type);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { policy_type, heading, description, display_order, is_active } = body;

    if (!policy_type || !heading || !description) {
      return NextResponse.json(
        { error: 'policy_type, heading, and description are required' },
        { status: 400 }
      );
    }

    const supabase = await getClient();
    const { data, error } = await supabase
      .from('policies')
      .insert([
        {
          policy_type,
          heading: heading.trim(),
          description: description.trim(),
          display_order: Number(display_order) || 0,
          is_active: is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, policy_type, heading, description, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }

    const supabase = await getClient();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (policy_type !== undefined) updateData.policy_type = policy_type;
    if (heading !== undefined) updateData.heading = heading.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (display_order !== undefined) updateData.display_order = Number(display_order);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const { data, error } = await supabase
      .from('policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }

    const supabase = await getClient();
    const { error } = await supabase.from('policies').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
