// Utility to delete image from Cloudinary using public_id
// This should be called from a server-side environment (API route or server action)

export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary config missing');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`;

  // Cloudinary requires Basic Auth for this endpoint
  const credentials = btoa(`${apiKey}:${apiSecret}`);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_ids: [publicId] }),
  });

  return res.ok;
}
