import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extracts Cloudinary public_id from a URL or returns the public_id as-is.
 * Example URL:
 * https://res.cloudinary.com/demo/image/upload/v1312461204/dfd-sports/products/sample.jpg
 * -> "dfd-sports/products/sample"
 */
export function extractPublicId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already a public_id (no protocol)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes('cloudinary.com')) {
      return null;
    }

    const segments = url.pathname.split('/upload/');
    if (segments.length < 2) return null;

    let pathAfterUpload = segments[1];
    // Remove optional version segment like "v1712345678/"
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

    // Remove file extension
    const lastDotIndex = pathAfterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return pathAfterUpload.substring(0, lastDotIndex);
    }

    return pathAfterUpload;
  } catch {
    return null;
  }
}

/**
 * Uploads a file (base64 data URI or Buffer) to Cloudinary
 */
export async function uploadToCloudinary(
  fileDataUri: string,
  folder = 'dfd-sports'
): Promise<{ url: string; public_id: string; secure_url: string }> {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder: folder,
    resource_type: 'auto',
  });

  return {
    url: result.secure_url,
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

/**
 * Deletes a file from Cloudinary given its public_id or full URL
 */
export async function deleteFromCloudinary(
  urlOrPublicId: string
): Promise<{ success: boolean; result?: string; message?: string }> {
  const publicId = extractPublicId(urlOrPublicId);
  if (!publicId) {
    return { success: false, message: 'Invalid or non-Cloudinary public_id / URL' };
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return {
      success: res.result === 'ok' || res.result === 'not found',
      result: res.result,
    };
  } catch (error: any) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      message: error?.message || 'Cloudinary delete failed',
    };
  }
}

export default cloudinary;
