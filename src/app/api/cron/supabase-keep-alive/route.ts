import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Vercel Cron authorization header if CRON_SECRET is configured
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();

    // 2. Perform lightweight query to maintain Supabase activity
    const supabase = createPublicSupabaseClient();

    // Fetch 1 row ID from company_settings (or categories as fallback)
    const { data, error } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1);

    if (error) {
      // Fallback query to ensure connection is maintained even if table differs
      const fallback = await supabase.from('categories').select('id').limit(1);
      if (fallback.error) {
        throw new Error(fallback.error.message);
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Supabase project keep-alive ping succeeded',
      timestamp: new Date().toISOString(),
      durationMs,
    });
  } catch (error: unknown) {
    const err = error as Error | undefined;
    console.error('[Supabase Keep-Alive Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to ping Supabase project',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
