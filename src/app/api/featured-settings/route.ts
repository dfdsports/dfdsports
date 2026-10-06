import { NextResponse } from 'next/server';
import { getFeaturedSettings, saveFeaturedSettings, FEATURED_BG_COLORS } from '@/services/featuredSettings';

export async function GET() {
  const settings = getFeaturedSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const colorId = body?.colorId;
    const cardColors: Record<string, string> = body?.cardColors ?? {};

    if (!colorId || !FEATURED_BG_COLORS.some((c) => c.id === colorId)) {
      return NextResponse.json(
        { error: 'Invalid colorId. Choose from the 7 available colors.' },
        { status: 400 }
      );
    }

    // Validate all per-card colorIds
    for (const [, cid] of Object.entries(cardColors)) {
      if (!FEATURED_BG_COLORS.some((c) => c.id === cid)) {
        return NextResponse.json(
          { error: `Invalid card colorId: "${cid}"` },
          { status: 400 }
        );
      }
    }

    const settings = saveFeaturedSettings(colorId, cardColors);
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
