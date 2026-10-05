import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let base64Data: string = '';
    let folder: string = 'dfd-sports';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const requestedFolder = formData.get('folder') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      if (requestedFolder) {
        folder = requestedFolder;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || 'image/jpeg';
      base64Data = `data:${mime};base64,${buffer.toString('base64')}`;
    } else {
      const body = await request.json();
      if (!body.file) {
        return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
      }
      base64Data = body.file;
      if (body.folder) {
        folder = body.folder;
      }
    }

    const uploadResult = await uploadToCloudinary(base64Data, folder);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media to Cloudinary' },
      { status: 500 }
    );
  }
}
