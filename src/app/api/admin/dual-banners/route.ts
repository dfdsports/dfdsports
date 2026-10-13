import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/auth';
import { getDualBannersSettings, saveDualBannersSettings } from '@/services/dualBanners';
import { DualBannersSettings } from '@/types/dualBanners';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getDualBannersSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch banner settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as DualBannersSettings;
    if (!body || !body.left_banner || !body.right_banner) {
      return NextResponse.json(
        { success: false, error: 'Invalid dual banner payload' },
        { status: 400 }
      );
    }

    const saved = await saveDualBannersSettings(body);
    return NextResponse.json({ success: true, settings: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save dual banners settings' },
      { status: 500 }
    );
  }
}
