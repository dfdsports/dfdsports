import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const target = body.public_id || body.url;

    if (!target) {
      return NextResponse.json(
        { error: 'Missing public_id or url to delete' },
        { status: 400 }
      );
    }

    const deleteResult = await deleteFromCloudinary(target);

    return NextResponse.json({
      success: deleteResult.success,
      result: deleteResult.result,
      message: deleteResult.message,
    });
  } catch (error: any) {
    console.error('Media delete error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete media from Cloudinary' },
      { status: 500 }
    );
  }
}
