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
 * Supports:
 * - standard URLs: https://res.cloudinary.com/demo/image/upload/v1312461204/dfd-sports/products/sample.jpg
 * - URLs with transformations: .../image/upload/f_auto,q_auto/v1791293795/Abstract_Brush.png
 * - URLs without versions: .../image/upload/dfd-sports/products/sample.png
 * - Encoded URLs with spaces / special characters
 */
export function extractPublicId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already a public_id (no protocol)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    const clean = trimmed.split('?')[0].split('#')[0];
    const lastDot = clean.lastIndexOf('.');
    if (lastDot !== -1 && lastDot > clean.lastIndexOf('/')) {
      return decodeURIComponent(clean.substring(0, lastDot));
    }
    return decodeURIComponent(clean);
  }

  try {
    const parsedUrl = new URL(trimmed);
    if (!parsedUrl.hostname.includes('cloudinary.com')) {
      return null;
    }

    const decodedPath = decodeURIComponent(parsedUrl.pathname);
    // Cloudinary URLs standard: /<cloud>/<resource_type>/<type>/[<transformations>/][<version>/]<public_id>.<ext>
    const match = decodedPath.match(/\/(?:upload|private|authenticated)\/(.+)$/);
    if (!match || !match[1]) {
      return null;
    }

    const pathAfterUpload = match[1];
    const segments = pathAfterUpload.split('/');

    // Check if there is a version segment like "v1712345678"
    const versionIdx = segments.findIndex((seg) => /^v\d+$/.test(seg));

    let publicIdSegments: string[];
    if (versionIdx !== -1) {
      publicIdSegments = segments.slice(versionIdx + 1);
    } else {
      // Skip leading transformation segments if any
      let startIdx = 0;
      while (
        startIdx < segments.length - 1 &&
        (segments[startIdx].includes(',') ||
          /^[a-z]{1,3}_[a-zA-Z0-9_,-]+$/.test(segments[startIdx]))
      ) {
        startIdx++;
      }
      publicIdSegments = segments.slice(startIdx);
    }

    if (publicIdSegments.length === 0) return null;

    let fullPublicId = publicIdSegments.join('/');

    // Remove file extension from the final segment (.png, .jpg, etc.)
    const lastDot = fullPublicId.lastIndexOf('.');
    if (lastDot !== -1 && lastDot > fullPublicId.lastIndexOf('/')) {
      fullPublicId = fullPublicId.substring(0, lastDot);
    }

    return fullPublicId;
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
 * Deletes a file from Cloudinary given its public_id or full URL.
 * Automatically tries 'image', 'raw', and 'video' resource types and name variations.
 */
export async function deleteFromCloudinary(
  urlOrPublicId: string
): Promise<{ success: boolean; result?: string; message?: string }> {
  const publicId = extractPublicId(urlOrPublicId);
  if (!publicId) {
    return { success: false, message: 'Invalid or non-Cloudinary public_id / URL' };
  }

  try {
    // 1. Try destroying as resource_type: 'image'
    let res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });

    // 2. Fallback to resource_type: 'raw' (SVGs, PDFs, generic assets)
    if (res.result === 'not found') {
      const rawRes = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'raw',
      });
      if (rawRes.result === 'ok') {
        res = rawRes;
      }
    }

    // 3. Fallback to resource_type: 'video'
    if (res.result === 'not found') {
      const videoRes = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'video',
      });
      if (videoRes.result === 'ok') {
        res = videoRes;
      }
    }

    // 4. Fallback for public IDs with spaces converted to underscores
    if (res.result === 'not found' && publicId.includes(' ')) {
      const underscoreId = publicId.replace(/ /g, '_');
      const retryRes = await cloudinary.uploader.destroy(underscoreId, {
        invalidate: true,
        resource_type: 'image',
      });
      if (retryRes.result === 'ok') {
        res = retryRes;
      }
    }

    // 5. Fallback with original file extension if raw asset kept extension
    if (res.result === 'not found') {
      const extMatch = urlOrPublicId.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
      if (extMatch && extMatch[1]) {
        const idWithExt = `${publicId}.${extMatch[1]}`;
        const rawWithExtRes = await cloudinary.uploader.destroy(idWithExt, {
          invalidate: true,
          resource_type: 'raw',
        });
        if (rawWithExtRes.result === 'ok') {
          res = rawWithExtRes;
        }
      }
    }

    console.log(`[Cloudinary Destroy] "${publicId}" -> ${res.result}`);

    return {
      success: res.result === 'ok' || res.result === 'not found',
      result: res.result,
    };
  } catch (error: unknown) {
    const err = error as Error | undefined;
    console.error('[Cloudinary Destroy Error]:', error);
    return {
      success: false,
      message: err?.message || 'Cloudinary delete failed',
    };
  }
}

export default cloudinary;
