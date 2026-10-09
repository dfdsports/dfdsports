import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { getAdminUser } from '@/lib/supabase/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let admin = await getAdminUser();
    if (!admin) {
      // Fallback: check Bearer token if session cookie wasn't picked up
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) admin = user;
      }
    }

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const targets: string[] = Array.isArray(body.urls)
      ? body.urls
      : Array.isArray(body.targets)
      ? body.targets
      : body.public_id || body.url
      ? [body.public_id || body.url]
      : [];

    if (targets.length === 0) {
      return NextResponse.json(
        { error: 'Missing public_id or url to delete' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      targets.map((target) => deleteFromCloudinary(target))
    );

    const allSuccessful = results.every((r) => r.success);

    return NextResponse.json({
      success: allSuccessful,
      results,
      deletedCount: results.filter((r) => r.success).length,
    });
  } catch (error: unknown) {
    const err = error as Error | undefined;
    console.error('Media delete error:', error);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete media from Cloudinary' },
      { status: 500 }
    );
  }
}
