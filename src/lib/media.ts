import { createClient } from '@/lib/supabase/client';

/**
 * Client-side media utilities to upload and delete images in Cloudinary
 */

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
    }
  } catch {
    // Ignore if session cannot be fetched
  }
  return headers;
}

/**
 * Compresses an image file only if it exceeds 3MB (3 * 1024 * 1024 bytes).
 * If the file is 3MB or smaller, the original file is returned untouched.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  const THREE_MB = 3 * 1024 * 1024; // 3,145,728 bytes

  // 1. Only compress if file is larger than 3 MB
  if (!file || file.size <= THREE_MB) {
    return file;
  }

  // 2. Only compress image files (skip GIFs and SVGs to preserve animation / vector quality)
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  // 3. Ensure running in browser environment with canvas support
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let { width, height } = img;
        const MAX_DIMENSION = 2560; // Preserve high resolution up to 2.5K

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const tryExport = (mime: string, quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const ext = mime === 'image/webp' ? '.webp' : '.jpg';
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const compressedFile = new File([blob], `${baseName}${ext}`, {
                  type: blob.type || mime,
                  lastModified: Date.now(),
                });
                console.log(
                  `[Image Compression] File > 3MB: Compressed "${file.name}" from ${(file.size / (1024 * 1024)).toFixed(2)} MB to ${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB`
                );
                resolve(compressedFile);
              } else if (mime === 'image/webp') {
                // Fallback to jpeg if webp was not smaller
                tryExport('image/jpeg', 0.82);
              } else {
                resolve(file);
              }
            },
            mime,
            quality
          );
        };

        tryExport('image/webp', 0.82);
      } catch (err) {
        console.warn('Canvas compression error, using original file:', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export async function uploadImageToCloudinary(
  file: File,
  folder = 'dfd-sports'
): Promise<string> {
  // Automatically compress file if larger than 3MB
  const fileToUpload = await compressImageIfNeeded(file);

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('folder', folder);

  const authHeaders = await getAuthHeaders();

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload image to Cloudinary');
  }

  return data.url;
}

export async function deleteImageFromCloudinary(
  urlOrPublicId: string | string[]
): Promise<boolean> {
  if (!urlOrPublicId) return true;

  const targets = Array.isArray(urlOrPublicId)
    ? urlOrPublicId.filter(Boolean)
    : [urlOrPublicId].filter(Boolean);

  if (targets.length === 0) return true;

  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/media/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(targets.length === 1 ? { url: targets[0] } : { urls: targets }),
    });

    const data = await res.json();
    return data.success ?? false;
  } catch (err) {
    console.warn('Failed to delete image from Cloudinary:', err);
    return false;
  }
}
