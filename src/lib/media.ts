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

export async function uploadImageToCloudinary(
  file: File,
  folder = 'dfd-sports'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
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
