// Next.js API route for deleting image from Cloudinary securely
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ error: 'Missing publicId' });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary config missing' });
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`;
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const cloudRes = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_ids: [publicId] }),
    });
    if (!cloudRes.ok) {
      const err = await cloudRes.json();
      return res.status(500).json({ error: 'Cloudinary delete failed', details: err });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Cloudinary delete error', details: error });
  }
}
