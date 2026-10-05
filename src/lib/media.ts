/**
 * Client-side media utilities to upload and delete images in Cloudinary
 */

export async function uploadImageToCloudinary(
  file: File,
  folder = 'dfd-sports'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload image to Cloudinary');
  }

  return data.url;
}

export async function deleteImageFromCloudinary(
  urlOrPublicId: string
): Promise<boolean> {
  if (!urlOrPublicId) return true;

  try {
    const res = await fetch('/api/media/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrPublicId }),
    });

    const data = await res.json();
    return data.success ?? false;
  } catch (err) {
    console.warn('Failed to delete image from Cloudinary:', err);
    return false;
  }
}
